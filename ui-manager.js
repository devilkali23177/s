// UI management functions
function initUI() {
  // Set up toolbar button event listeners
  document.getElementById('addBtn').addEventListener('click', addNewNode);
  document.getElementById('connectBtn').addEventListener('click', toggleConnectingMode);
  document.getElementById('editBtn').addEventListener('click', editSelectedNode);
  document.getElementById('deleteBtn').addEventListener('click', deleteSelectedNode);
  document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
  document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
  document.getElementById('resetViewBtn').addEventListener('click', resetZoom);
  document.getElementById('colorBtn').addEventListener('click', changeSelectedNodeColor);
  document.getElementById('exportBtn').addEventListener('click', exportMindMap);
  document.getElementById('importBtn').addEventListener('click', triggerImport);
  document.getElementById('importInput').addEventListener('change', handleImportFileSelect);
  document.getElementById('layoutBtn').addEventListener('change', handleLayoutChange);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('saveBtn').addEventListener('click', saveToCloud);
  document.getElementById('loadBtn').addEventListener('click', loadFromCloud);
  document.getElementById('mapsBtn').addEventListener('click', showMapManager);
  document.getElementById('expandCollapseBtn').addEventListener('click', toggleExpandCollapseAll);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  // Set up edit panel event listeners
  document.getElementById('edit-panel-save').addEventListener('click', saveNodeEdit);
  document.getElementById('edit-panel-cancel').addEventListener('click', closeEditPanel);
  document.getElementById('overlay').addEventListener('click', closeEditPanel);
  
  // Set up context menu
  initContextMenu();
  
  // Set up authentication UI
  initAuthUI();
  
  // Set up map manager UI
  initMapManagerUI();
}

function addNewNode() {
  if (!selectedNode) {
    // If no node is selected, create a new central idea
    createNode("New Idea", 500, 300);
  } else {
    // Create a child node
    const parentX = selectedNode.x;
    const parentY = selectedNode.y;
    const childX = parentX + 200;
    const childY = parentY;
    
    const newNode = createNode("New Node", childX, childY);
    connectNodes(selectedNode.id, newNode.id);
  }
}

function toggleConnectingMode() {
  isConnecting = !isConnecting;
  document.getElementById('connectBtn').classList.toggle('active', isConnecting);
}

function editSelectedNode() {
  if (selectedNode) {
    openEditPanel(selectedNode);
  }
}

function deleteSelectedNode() {
  if (selectedNode) {
    deleteNode(selectedNode.id);
  }
}

function changeSelectedNodeColor() {
  if (!selectedNode) return;
  
  // Show color picker menu near the selected node
  const colorMenu = document.getElementById('color-picker-menu');
  const rect = selectedNode.element.getBoundingClientRect();
  
  colorMenu.style.left = `${rect.right + 10}px`;
  colorMenu.style.top = `${rect.top}px`;
  colorMenu.style.display = 'block';
  
  // Populate color options if not already done
  if (colorMenu.querySelectorAll('.color-option').length === 0) {
    const colors = [
      '#333', '#4361ee', '#3a0ca3', '#7209b7', '#f72585',
      '#4cc9f0', '#4895ef', '#560bad', '#b5179e', '#f72585',
      '#ff9e00', '#ff6b00', '#ff0054', '#a8dadc', '#457b9d'
    ];
    
    const colorPicker = colorMenu.querySelector('.color-picker');
    colors.forEach(color => {
      const colorOption = document.createElement('div');
      colorOption.className = 'color-option';
      colorOption.style.backgroundColor = color;
      colorOption.dataset.color = color;
      colorOption.addEventListener('click', () => {
        changeNodeColor(selectedNode.id, color);
        colorMenu.style.display = 'none';
      });
      colorPicker.appendChild(colorOption);
    });
  }
}

function triggerImport() {
  document.getElementById('importInput').click();
}

function handleImportFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    importMindMap(file);
  }
  e.target.value = ''; // Reset input
}

function handleLayoutChange(e) {
  applyLayout(e.target.value);
}

function handleSearch(e) {
  searchNodes(e.target.value);
}

function saveToCloud() {
  if (!auth.currentUser) {
    alert('Please log in to save to the cloud');
    return;
  }
  
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
  
  const mapName = prompt('Enter a name for this mind map:', 'My Mind Map');
  if (mapName) {
    saveMindMap(auth.currentUser.uid, mapName, data)
      .then(() => alert('Mind map saved successfully!'))
      .catch(error => {
        console.error('Error saving mind map:', error);
        alert('Failed to save mind map: ' + error.message);
      });
  }
}

function loadFromCloud() {
  if (!auth.currentUser) {
    alert('Please log in to load from the cloud');
    return;
  }
  
  showMapManager();
}

function showMapManager() {
  document.getElementById('map-manager-container').style.display = 'flex';
}

function initContextMenu() {
  const contextMenu = document.getElementById('node-context-menu');
  
  // Hide context menu when clicking elsewhere
  document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
  });
  
  // Show context menu on right-click
  document.addEventListener('contextmenu', (e) => {
    const nodeElement = e.target.closest('.node');
    if (nodeElement) {
      e.preventDefault();
      
      const nodeId = parseInt(nodeElement.dataset.id);
      selectedNode = nodes.find(n => n.id === nodeId);
      selectNode(nodeElement);
      
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top = `${e.pageY}px`;
      contextMenu.style.display = 'block';
    }
  });
  
  // Handle context menu actions
  contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      
      switch(action) {
        case 'edit':
          if (selectedNode) openEditPanel(selectedNode);
          break;
        case 'color':
          if (selectedNode) changeSelectedNodeColor();
          break;
        case 'delete':
          if (selectedNode) deleteNode(selectedNode.id);
          break;
        case 'add-child':
          if (selectedNode) addNewNode();
          break;
        case 'toggle-expand':
          // Implementation for expand/collapse would go here
          console.log("Toggle expand/collapse");
          break;
      }
      
      contextMenu.style.display = 'none';
    });
  });
}

function initAuthUI() {
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('signup-btn').addEventListener('click', handleSignup);
  document.getElementById('guest-btn').addEventListener('click', handleGuestLogin);
}

function handleLogin() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  
  if (!email || !password) {
    showAuthMessage('Please enter both email and password');
    return;
  }
  
  login(email, password)
    .then(() => {
      // Success handled by auth state listener
    })
    .catch(error => {
      showAuthMessage('Login failed: ' + error.message);
    });
}

function handleSignup() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  
  if (!email || !password) {
    showAuthMessage('Please enter both email and password');
    return;
  }
  
  if (password.length < 6) {
    showAuthMessage('Password should be at least 6 characters');
    return;
  }
  
  signup(email, password)
    .then(() => {
      // Success handled by auth state listener
    })
    .catch(error => {
      showAuthMessage('Signup failed: ' + error.message);
    });
}

function handleGuestLogin() {
  loginAsGuest()
    .then(() => {
      // Success handled by auth state listener
    })
    .catch(error => {
      showAuthMessage('Guest login failed: ' + error.message);
    });
}

function showAuthMessage(message) {
  const messageElement = document.getElementById('auth-message');
  messageElement.textContent = message;
  
  // Clear message after 5 seconds
  setTimeout(() => {
    messageElement.textContent = '';
  }, 5000);
}

function initMapManagerUI() {
  document.getElementById('create-map-btn').addEventListener('click', createNewMap);
  document.getElementById('close-map-manager').addEventListener('click', () => {
    document.getElementById('map-manager-container').style.display = 'none';
  });
}

function createNewMap() {
  const mapName = document.getElementById('new-map-input').value.trim();
  
  if (!mapName) {
    alert('Please enter a map name');
    return;
  }
  
  // Create an empty mind map
  const data = {
    nodes: [],
    connections: [],
    nextId: 1
  };
  
  saveMindMap(auth.currentUser.uid, mapName, data)
    .then(() => {
      document.getElementById('new-map-input').value = '';
      loadUserMaps(auth.currentUser.uid);
    })
    .catch(error => {
      alert('Failed to create map: ' + error.message);
    });
}

function loadUserMaps(userId) {
  getUserMaps(userId)
    .then(snapshot => {
      const maps = snapshot.val();
      const mapList = document.getElementById('map-list');
      mapList.innerHTML = '';
      
      if (!maps) {
        mapList.innerHTML = '<p>No maps found. Create your first map!</p>';
        return;
      }
      
      Object.entries(maps).forEach(([mapName, mapData]) => {
        const mapItem = document.createElement('div');
        mapItem.className = 'map-item';
        
        mapItem.innerHTML = `
          <div class="map-name">${mapName}</div>
          <div class="map-actions">
            <button class="load-btn">Load</button>
            <button class="delete-btn">Delete</button>
          </div>
        `;
        
        mapItem.querySelector('.load-btn').addEventListener('click', () => {
          loadMap(userId, mapName);
        });
        
        mapItem.querySelector('.delete-btn').addEventListener('click', () => {
          deleteMap(userId, mapName);
        });
        
        mapList.appendChild(mapItem);
      });
    })
    .catch(error => {
      console.error('Error loading user maps:', error);
    });
}

function loadMap(userId, mapName) {
  loadMindMap(userId, mapName)
    .then(snapshot => {
      const mapData = snapshot.val();
      
      if (mapData && mapData.data) {
        // Clear existing nodes
        nodes.forEach(node => {
          if (node.element) node.element.remove();
        });
        nodes = [];
        connections = [];
        selectedNode = null;
        
        // Import nodes from saved data
        mapData.data.nodes.forEach(nodeData => {
          const node = createNode(nodeData.text, nodeData.x, nodeData.y, nodeData.color);
          node.id = nodeData.id;
          node.children = nodeData.children || [];
          
          // Update nextId to avoid conflicts
          if (nodeData.id >= nextId) {
            nextId = nodeData.id + 1;
          }
        });
        
        // Import connections
        mapData.data.connections.forEach(conn => {
          connections.push(conn);
        });
        
        // Update connections display
        updateConnections();
        
        // Close map manager
        document.getElementById('map-manager-container').style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error loading map:', error);
      alert('Failed to load map: ' + error.message);
    });
}

function deleteMap(userId, mapName) {
  if (confirm(`Are you sure you want to delete "${mapName}"?`)) {
    deleteMindMap(userId, mapName)
      .then(() => {
        loadUserMaps(userId);
      })
      .catch(error => {
        alert('Failed to delete map: ' + error.message);
      });
  }
}