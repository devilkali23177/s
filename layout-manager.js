// Layout management functions
let currentLayout = 'radial';
let zoomLevel = 1;

function initLayoutManager() {
  // Set up initial layout
  applyLayout(currentLayout);
}

function applyLayout(layoutType) {
  currentLayout = layoutType;
  
  switch(layoutType) {
    case 'horizontal':
      applyHorizontalLayout();
      break;
    case 'vertical':
      applyVerticalLayout();
      break;
    case 'radial':
      applyRadialLayout();
      break;
    case 'tree':
      applyTreeLayout();
      break;
    default:
      applyRadialLayout();
  }
  
  // Update connections
  updateConnections();
}

function applyHorizontalLayout() {
  if (nodes.length === 0) return;
  
  // Find root node (assuming first node is root for simplicity)
  const rootNode = nodes[0];
  const rootX = 500;
  const rootY = 300;
  
  // Position root node
  rootNode.x = rootX;
  rootNode.y = rootY;
  rootNode.element.style.left = `${rootX}px`;
  rootNode.element.style.top = `${rootY}px`;
  
  // Position child nodes horizontally
  const horizontalSpacing = 200;
  const verticalSpacing = 100;
  
  let currentX = rootX + horizontalSpacing;
  let currentY = rootY;
  let direction = 1; // 1 for down, -1 for up
  
  nodes.forEach(node => {
    if (node.id !== rootNode.id) {
      node.x = currentX;
      node.y = currentY;
      node.element.style.left = `${currentX}px`;
      node.element.style.top = `${currentY}px`;
      
      currentY += verticalSpacing * direction;
      
      // Change direction if we've gone too far
      if (Math.abs(currentY - rootY) > 200) {
        direction *= -1;
        currentX += horizontalSpacing;
        currentY = rootY;
      }
    }
  });
}

function applyVerticalLayout() {
  if (nodes.length === 0) return;
  
  // Find root node
  const rootNode = nodes[0];
  const rootX = 500;
  const rootY = 100;
  
  // Position root node
  rootNode.x = rootX;
  rootNode.y = rootY;
  rootNode.element.style.left = `${rootX}px`;
  rootNode.element.style.top = `${rootY}px`;
  
  // Position child nodes vertically
  const horizontalSpacing = 150;
  const verticalSpacing = 100;
  
  let currentX = rootX;
  let currentY = rootY + verticalSpacing;
  let direction = 1; // 1 for right, -1 for left
  
  nodes.forEach(node => {
    if (node.id !== rootNode.id) {
      node.x = currentX;
      node.y = currentY;
      node.element.style.left = `${currentX}px`;
      node.element.style.top = `${currentY}px`;
      
      currentX += horizontalSpacing * direction;
      
      // Change direction if we've gone too far
      if (Math.abs(currentX - rootX) > 300) {
        direction *= -1;
        currentY += verticalSpacing;
        currentX = rootX;
      }
    }
  });
}

function applyRadialLayout() {
  if (nodes.length === 0) return;
  
  // Find root node
  const rootNode = nodes[0];
  const centerX = 500;
  const centerY = 300;
  
  // Position root node at center
  rootNode.x = centerX;
  rootNode.y = centerY;
  rootNode.element.style.left = `${centerX}px`;
  rootNode.element.style.top = `${centerY}px`;
  
  // Position child nodes in a circle around the root
  const radius = 200;
  const angleStep = (2 * Math.PI) / (nodes.length - 1);
  let angle = 0;
  
  nodes.forEach(node => {
    if (node.id !== rootNode.id) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      node.x = x;
      node.y = y;
      node.element.style.left = `${x}px`;
      node.element.style.top = `${y}px`;
      
      angle += angleStep;
    }
  });
}

function applyTreeLayout() {
  if (nodes.length === 0) return;
  
  // Find root node
  const rootNode = nodes[0];
  const rootX = 500;
  const rootY = 100;
  
  // Position root node
  rootNode.x = rootX;
  rootNode.y = rootY;
  rootNode.element.style.left = `${rootX}px`;
  rootNode.element.style.top = `${rootY}px`;
  
  // Recursively position child nodes in a tree structure
  positionChildren(rootNode, rootX, rootY, 1);
}

function positionChildren(node, parentX, parentY, level) {
  if (!node.children || node.children.length === 0) return;
  
  const horizontalSpacing = 200;
  const verticalSpacing = 100;
  const startX = parentX - ((node.children.length - 1) * horizontalSpacing) / 2;
  
  node.children.forEach((childId, index) => {
    const childNode = nodes.find(n => n.id === childId);
    if (childNode) {
      const x = startX + index * horizontalSpacing;
      const y = parentY + verticalSpacing;
      
      childNode.x = x;
      childNode.y = y;
      childNode.element.style.left = `${x}px`;
      childNode.element.style.top = `${y}px`;
      
      // Position children of this child
      positionChildren(childNode, x, y, level + 1);
    }
  });
}

function zoomIn() {
  zoomLevel += 0.1;
  applyZoom();
}

function zoomOut() {
  zoomLevel -= 0.1;
  if (zoomLevel < 0.1) zoomLevel = 0.1;
  applyZoom();
}

function resetZoom() {
  zoomLevel = 1;
  applyZoom();
}

function applyZoom() {
  document.getElementById('world').style.transform = `scale(${zoomLevel})`;
  document.getElementById('zoom-display').textContent = `${Math.round(zoomLevel * 100)}%`;
}

function searchNodes(query) {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    // Reset all nodes if search is empty
    nodes.forEach(node => {
      node.element.style.backgroundColor = node.color;
    });
    return;
  }
  
  // Highlight nodes that match the search
  nodes.forEach(node => {
    if (node.text.toLowerCase().includes(searchTerm)) {
      node.element.style.backgroundColor = '#ff0';
      node.element.style.color = '#000';
    } else {
      node.element.style.backgroundColor = node.color;
      node.element.style.color = '#fff';
    }
  });
}