let heap = [];
let bstRoot = null;
let treeType = "heap";  // Default to Heap
let heapType = "max";   // Default to Max-Heap

const svg = d3.select("svg");
const width = svg.node().getBoundingClientRect().width;
const height = +svg.attr("height");

// Create a group that will be centered
const g = svg.append("g");

// D3 tree layout
const treeLayout = d3.tree().nodeSize([50, 100]);

// Update tree type on user selection
document.getElementById("tree-type").addEventListener("change", function() {
    treeType = this.value;
    updateVisualization();
    document.getElementById("heap-type-label").style.display = treeType === "heap" ? "inline" : "none";
    document.getElementById("heap-type").style.display = treeType === "heap" ? "inline" : "none";
});

// Update heap type on user selection
document.getElementById("heap-type").addEventListener("change", function() {
    heapType = this.value;
    updateVisualization();
});

// Function to swap two elements in the heap
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// Function to maintain heap property after insertion (heapify up)
function heapifyUp() {
    let index = heap.length - 1;
    while (index > 0) {
        let parentIndex = Math.floor((index - 1) / 2);
        if (
            (heapType === "max" && heap[index] > heap[parentIndex]) ||
            (heapType === "min" && heap[index] < heap[parentIndex])
        ) {
            swap(heap, index, parentIndex);
            index = parentIndex;
        } else {
            break;
        }
    }
}

// Function to insert a node into the BST
function insertBST(root, value) {
    if (root === null) {
        return { name: value, children: [] };
    }
    if (value < root.name) {
        root.children[0] = insertBST(root.children[0], value);
    } else {
        root.children[1] = insertBST(root.children[1], value);
    }
    return root;
}

// Function to add a node to the heap, binary tree, or BST
function addNode() {
    const inputValue = parseInt(document.getElementById("node-value").value);
    if (!isNaN(inputValue)) {
        if (treeType === "heap") {
            heap.push(inputValue);
            heapifyUp();
        } else if (treeType === "binary" || treeType === "bst") {
            bstRoot = insertBST(bstRoot, inputValue);
        }
        updateVisualization();
    }
}

// Convert heap or binary tree to hierarchical data structure for D3
function convertToD3Format(index) {
    if (index >= heap.length) return null;
    return {
        name: heap[index],
        children: [
            convertToD3Format(2 * index + 1),
            convertToD3Format(2 * index + 2)
        ].filter(child => child !== null)
    };
}

function convertBSTToD3Format(root) {
    if (!root) return null;
    return {
        name: root.name,
        children: [
            convertBSTToD3Format(root.children[0]),
            convertBSTToD3Format(root.children[1])
        ].filter(child => child !== null)
    };
}

// Function to update the visualization
function updateVisualization() {
    g.selectAll("*").remove(); // Clear previous tree

    let data;
    if (treeType === "heap") {
        data = convertToD3Format(0);
    } else if (treeType === "binary" || treeType === "bst") {
        data = convertBSTToD3Format(bstRoot);
    }

    if (!data) return;

    const rootD3 = d3.hierarchy(data);
    treeLayout(rootD3);

    const nodes = rootD3.descendants();
    const links = rootD3.links();

    // Calculate tree dimensions
    const maxWidth = d3.max(nodes, d => d.x);
    const maxHeight = d3.max(nodes, d => d.y);

    // Update SVG size to fit the tree
    svg.attr("width", maxWidth + 200); // Add extra space for padding
    svg.attr("height", maxHeight + 100);

    // Center the group element
    g.attr("transform", `translate(${svg.attr("width") / 2 - maxWidth / 2}, 50)`);

    // Render links
    const link = g.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    // Render nodes
    const node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    node.append("circle")
        .attr("r", 20)
        .on("mouseover", function() {
            d3.select(this).classed("highlight", true);
        })
        .on("mouseout", function() {
            d3.select(this).classed("highlight", false);
        });

    // Append text elements to show node values
    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.data.name);
}

// Function to reset the tree visualization
function resetTree() {
    heap = [];
    bstRoot = null;
    document.getElementById("node-value").value = "";
    updateVisualization();
}

// Initial empty visualization
updateVisualization();
