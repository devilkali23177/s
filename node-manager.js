// Node management functions
let nodes = [];
let connections = [];
let selectedNode = null;
let editingNode = null;
let nextId = 1;
let isConnecting = false;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };

function initNodeManager() {
  // Create initial node
  createNode("Central Idea", 500, 300);
  
  // Event listeners for node interactions
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
  
  // Double click to edit
  document.addEventListener('dblclick', handleDoubleClick);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
}

function createNode(text, x, y, color = "#333") {
  const id = nextId++;
  const node = document.createElement('div');
  node.className = 'node';
  node.id = `node-${id}`;
  node.innerHTML = `<div class="node-content">${text}</div>`;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.backgroundColor = color;
  node.dataset.id = id;
  
  node.addEventListener('click', (e) => {
    e.stopPropagation();
    selectNode(node);
  });
  
  document.getElementById('world').appendChild(node);
  
  const nodeData = {
    id: id,
    element: node,
    x: x,
    y: y,
    text: text,
    color: color,
    children: [],
    expanded: true
  };
  
  nodes.push(nodeData);
  return nodeData;
}

function selectNode(node) {
  // Deselect previous selection
  if (selectedNode) {
    selectedNode.element.classList.remove('selected');
  }
  
  // Select new node
  selectedNode = nodes.find(n => n.id === parseInt(node.dataset.id));
  if (selectedNode) {
    selectedNode.element.classList.add('selected');
    
    // Highlight connections
    highlightConnections(selectedNode.id);
  }
}

function deleteNode(nodeId) {
  const nodeIndex = nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) return;
  
  // Remove connections to this node
  connections = connections.filter(conn => 
    conn.source !== nodeId && conn.target !== nodeId
  );
  
  // Remove from parent's children
  nodes.forEach(node => {
    const childIndex = node.children.indexOf(nodeId);
    if (childIndex !== -1) {
      node.children.splice(childIndex, 1);
    }
  });
  
  // Remove node element
  const nodeElement = document.getElementById(`node-${nodeId}`);
  if (nodeElement) {
    nodeElement.remove();
  }
  
  // Remove from nodes array
  nodes.splice(nodeIndex, 1);
  
  // Update connections display
  updateConnections();
  
  // Clear selection
  selectedNode = null;
}

function editNode(nodeId, newText) {
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    node.text = newText;
    node.element.querySelector('.node-content').textContent = newText;
  }
}

function changeNodeColor(nodeId, color) {
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    node.color = color;
    node.element.style.backgroundColor = color;
  }
}

function connectNodes(sourceId, targetId) {
  // Check if connection already exists
  const connectionExists = connections.some(conn => 
    conn.source === sourceId && conn.target === targetId
  );
  
  if (connectionExists) return;
  
  // Add to connections array
  connections.push({
    source: sourceId,
    target: targetId
  });
  
  // Add to source node's children
  const sourceNode = nodes.find(n => n.id === sourceId);
  if (sourceNode && !sourceNode.children.includes(targetId)) {
    sourceNode.children.push(targetId);
  }
  
  // Update connections display
  updateConnections();
}

function updateConnections() {
  const edges = document.getElementById('edges');
  edges.innerHTML = '';
  
  connections.forEach(conn => {
    const sourceNode = nodes.find(n => n.id === conn.source);
    const targetNode = nodes.find(n => n.id === conn.target);
    
    if (sourceNode && targetNode) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sourceNode.x + sourceNode.element.offsetWidth / 2);
      line.setAttribute('y1', sourceNode.y + sourceNode.element.offsetHeight / 2);
      line.setAttribute('x2', targetNode.x + targetNode.element.offsetWidth / 2);
      line.setAttribute('y2', targetNode.y + targetNode.element.offsetHeight / 2);
      line.setAttribute('class', 'connection');
      line.dataset.source = conn.source;
      line.dataset.target = conn.target;
      
      edges.appendChild(line);
    }
  });
}

function highlightConnections(nodeId) {
  // Reset all connections
  document.querySelectorAll('.connection').forEach(line => {
    line.classList.remove('highlight');
  });
  
  // Highlight connections related to this node
  document.querySelectorAll('.connection').forEach(line => {
    if (line.dataset.source == nodeId || line.dataset.target == nodeId) {
      line.classList.add('highlight');
    }
  });
}

function handleMouseDown(e) {
  if (e.button !== 0) return; // Only left click
  
  const nodeElement = e.target.closest('.node');
  
  if (nodeElement) {
    // Node interaction
    const nodeId = parseInt(nodeElement.dataset.id);
    const node = nodes.find(n => n.id === nodeId);
    
    if (isConnecting && selectedNode && selectedNode.id !== nodeId) {
      // Connect nodes
      connectNodes(selectedNode.id, nodeId);
      isConnecting = false;
      document.getElementById('connectBtn').classList.remove('active');
    } else {
      // Start dragging
      isDragging = true;
      selectedNode = node;
      selectNode(nodeElement);
      
      // Calculate offset from mouse to node corner
      const rect = nodeElement.getBoundingClientRect();
      const worldRect = document.getElementById('world').getBoundingClientRect();
      dragOffset = {
        x: e.clientX - (rect.left - worldRect.left),
        y: e.clientY - (rect.top - worldRect.top)
      };
      
      nodeElement.classList.add('dragging');
      startPos = { x: node.x, y: node.y };
    }
  } else {
    // World interaction (panning)
    isDragging = true;
    startPos = { 
      x: e.clientX - parseInt(document.getElementById('world').style.left || 0),
      y: e.clientY - parseInt(document.getElementById('world').style.top || 0)
    };
  }
  
  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isDragging) return;
  
  if (selectedNode && selectedNode.element.classList.contains('dragging')) {
    // Move node
    const worldRect = document.getElementById('world').getBoundingClientRect();
    const newX = e.clientX - worldRect.left - dragOffset.x;
    const newY = e.clientY - worldRect.top - dragOffset.y;
    
    selectedNode.x = newX;
    selectedNode.y = newY;
    selectedNode.element.style.left = `${newX}px`;
    selectedNode.element.style.top = `${newY}px`;
    
    // Update connections
    updateConnections();
  } else {
    // Pan world
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    
    document.getElementById('world').style.left = `${dx}px`;
    document.getElementById('world').style.top = `${dy}px`;
  }
}

function handleMouseUp() {
  isDragging = false;
  
  if (selectedNode) {
    selectedNode.element.classList.remove('dragging');
  }
}

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const nodeElement = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (nodeElement && nodeElement.classList.contains('node')) {
      // Node interaction
      const nodeId = parseInt(nodeElement.dataset.id);
      const node = nodes.find(n => n.id === nodeId);
      
      if (isConnecting && selectedNode && selectedNode.id !== nodeId) {
        // Connect nodes
        connectNodes(selectedNode.id, nodeId);
        isConnecting = false;
        document.getElementById('connectBtn').classList.remove('active');
        e.preventDefault();
      } else {
        // Start dragging
        isDragging = true;
        selectedNode = node;
        selectNode(nodeElement);
        
        // Calculate offset from touch to node corner
        const rect = nodeElement.getBoundingClientRect();
        const worldRect = document.getElementById('world').getBoundingClientRect();
        dragOffset = {
          x: touch.clientX - (rect.left - worldRect.left),
          y: touch.clientY - (rect.top - worldRect.top)
        };
        
        nodeElement.classList.add('dragging');
        startPos = { x: node.x, y: node.y };
        e.preventDefault();
      }
    } else {
      // World interaction (panning)
      isDragging = true;
      startPos = { 
        x: touch.clientX - parseInt(document.getElementById('world').style.left || 0),
        y: touch.clientY - parseInt(document.getElementById('world').style.top || 0)
      };
    }
  } else if (e.touches.length === 2) {
    // Pinch to zoom
    // Implementation would go here
    e.preventDefault();
  }
}

function handleTouchMove(e) {
  if (!isDragging || e.touches.length !== 1) return;
  
  const touch = e.touches[0];
  
  if (selectedNode && selectedNode.element.classList.contains('dragging')) {
    // Move node
    const worldRect = document.getElementById('world').getBoundingClientRect();
    const newX = touch.clientX - worldRect.left - dragOffset.x;
    const newY = touch.clientY - worldRect.top - dragOffset.y;
    
    selectedNode.x = newX;
    selectedNode.y = newY;
    selectedNode.element.style.left = `${newX}px`;
    selectedNode.element.style.top = `${newY}px`;
    
    // Update connections
    updateConnections();
  } else {
    // Pan world
    const dx = touch.clientX - startPos.x;
    const dy = touch.clientY - startPos.y;
    
    document.getElementById('world').style.left = `${dx}px`;
    document.getElementById('world').style.top = `${dy}px`;
  }
  
  e.preventDefault();
}

function handleTouchEnd() {
  isDragging = false;
  
  if (selectedNode) {
    selectedNode.element.classList.remove('dragging');
  }
}

function handleDoubleClick(e) {
  const nodeElement = e.target.closest('.node');
  
  if (nodeElement) {
    const nodeId = parseInt(nodeElement.dataset.id);
    const node = nodes.find(n => n.id === nodeId);
    
    if (node) {
      openEditPanel(node);
    }
  }
}

function handleKeyDown(e) {
  if (e.key === 'Delete' && selectedNode) {
    deleteNode(selectedNode.id);
  } else if (e.key === 'Escape') {
    if (isConnecting) {
      isConnecting = false;
      document.getElementById('connectBtn').classList.remove('active');
    } else if (selectedNode) {
      selectedNode.element.classList.remove('selected');
      selectedNode = null;
    }
  }
}

function openEditPanel(node) {
  editingNode = node;
  document.getElementById('edit-textarea').value = node.text;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('edit-panel').style.display = 'block';
}

function closeEditPanel() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('edit-panel').style.display = 'none';
  editingNode = null;
}

function saveNodeEdit() {
  if (editingNode) {
    const newText = document.getElementById('edit-textarea').value.trim();
    if (newText) {
      editNode(editingNode.id, newText);
    }
  }
  closeEditPanel();
}

function exportMindMap() {
  const data = {
    nodes: nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      text: node.text,
      color: node.color,
      children: node.children
    })),
    connections: connections,
    nextId: nextId
  };
  
  const dataStr = JSON.stringify(data);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'mind-map.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importMindMap(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Clear existing nodes
      nodes.forEach(node => {
        if (node.element) node.element.remove();
      });
      nodes = [];
      connections = [];
      selectedNode = null;
      
      // Import nodes
      data.nodes.forEach(nodeData => {
        const node = createNode(nodeData.text, nodeData.x, nodeData.y, nodeData.color);
        node.id = nodeData.id;
        node.children = nodeData.children || [];
        
        // Update nextId to avoid conflicts
        if (nodeData.id >= nextId) {
          nextId = nodeData.id + 1;
        }
      });
      
      // Import connections
      data.connections.forEach(conn => {
        connections.push(conn);
      });
      
      // Update connections display
      updateConnections();
      
    } catch (error) {
      console.error('Error importing mind map:', error);
      alert('Failed to import mind map. The file may be corrupted.');
    }
  };
  reader.readAsText(file);
}

function toggleExpandCollapseAll() {
  // Implementation for expanding/collapsing all nodes
  // This would require additional functionality to hide/show child nodes
  console.log("Expand/Collapse All functionality would be implemented here");
}