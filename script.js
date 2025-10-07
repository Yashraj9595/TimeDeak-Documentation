// Common navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load common navigation if sidebar container exists but is empty
    const sidebarContainer = document.querySelector('.sidebar');
    if (sidebarContainer && sidebarContainer.innerHTML.trim() === '') {
        loadCommonNavigation();
    } else {
        // Initialize navigation functionality
        initializeNavigation();
    }
});

// Load common navigation from external file
function loadCommonNavigation() {
    const sidebarContainer = document.querySelector('.sidebar');
    if (!sidebarContainer) return;
    
    // Determine the correct path to navigation.html based on current page location
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;
    let navigationPath = 'navigation.html';
    
    // Adjust path based on subdirectory depth
    if (currentPath.includes('/features/') || currentPath.includes('/technologies/') || 
        currentPath.includes('/how-it-works/') || currentPath.includes('/impact/')) {
        navigationPath = '../navigation.html';
    }
    
    fetch(navigationPath)
        .then(response => response.text())
        .then(html => {
            sidebarContainer.innerHTML = html;
            // Fix relative links based on current page location
            adjustNavigationLinks();
            // Initialize navigation functionality
            initializeNavigation();
        })
        .catch(error => {
            console.error('Error loading navigation:', error);
            // Fallback: keep existing navigation if load fails
            initializeNavigation();
        });
}

// Adjust navigation links based on current page location
function adjustNavigationLinks() {
    const currentPath = window.location.pathname;
    const isInSubdirectory = currentPath.includes('/features/') || 
                           currentPath.includes('/technologies/') || 
                           currentPath.includes('/how-it-works/') || 
                           currentPath.includes('/impact/');
    
    if (isInSubdirectory) {
        const navLinks = document.querySelectorAll('.sidebar a[href]:not([href^="javascript:"])');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href.startsWith('http') && !href.startsWith('../')) {
                // Add ../ prefix for subdirectory pages
                if (href.includes('/')) {
                    // Already contains folder, just add ../
                    link.setAttribute('href', '../' + href);
                } else {
                    // Root level file, add ../
                    link.setAttribute('href', '../' + href);
                }
            }
        });
    }
}

// Initialize navigation functionality
function initializeNavigation() {
    // Setup dropdown functionality
    setupDropdowns();
    // Highlight current page
    highlightCurrentPage();
}

// Setup dropdown menus
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggleButton = dropdown.querySelector('.dropdown-toggle');
        const dropdownHeader = dropdown.querySelector('.dropdown-header');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        
        if (toggleButton && dropdownContent) {
            // Handle click on toggle button
            toggleButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns first
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('open');
            });
            
            // Handle click on dropdown header (excluding the toggle button)
            if (dropdownHeader) {
                dropdownHeader.addEventListener('click', function(e) {
                    // Only handle clicks on the header itself, not on the toggle button
                    if (e.target === dropdownHeader || e.target.classList.contains('dropdown-title')) {
                        e.preventDefault();
                        
                        // Close other dropdowns first
                        dropdowns.forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                otherDropdown.classList.remove('open');
                            }
                        });
                        
                        // Toggle current dropdown
                        dropdown.classList.toggle('open');
                    }
                });
            }
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
}

// Function to highlight the current page in navigation
function highlightCurrentPage() {
    // Get current page path and normalize it
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // Create a normalized current page identifier
    let currentPageId = currentFile.replace('.html', '');
    if (currentPath.includes('/features/')) {
        currentPageId = 'features/' + currentPageId;
    } else if (currentPath.includes('/technologies/')) {
        currentPageId = 'technologies/' + currentPageId;
    } else if (currentPath.includes('/how-it-works/')) {
        currentPageId = 'how-it-works/' + currentPageId;
    } else if (currentPath.includes('/impact/')) {
        currentPageId = 'impact/' + currentPageId;
    }
    
    // Handle index page special case
    if (currentFile === '' || currentFile === 'index.html') {
        currentPageId = 'index';
    }
    
    // Find all navigation links
    const navLinks = document.querySelectorAll('nav a[data-page]');
    
    // Clear all active classes first
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the current page link
    navLinks.forEach(link => {
        const linkPageId = link.getAttribute('data-page');
        
        if (linkPageId === currentPageId) {
            link.classList.add('active');
            
            // If this is a dropdown item, also expand and activate its parent dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentDropdownHeader = parentDropdown.querySelector('.dropdown-header');
                if (parentDropdownHeader) {
                    parentDropdownHeader.classList.add('active');
                }
                
                // Open the dropdown to show the active item
                parentDropdown.classList.add('open');
            }
        }
    });
    
    // Fallback: if no data-page match found, try href matching (for backward compatibility)
    if (document.querySelectorAll('nav a.active').length === 0) {
        const allNavLinks = document.querySelectorAll('nav a[href]:not([href^="javascript:"])');
        
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            let normalizedHref = href;
            
            // Convert relative paths for comparison
            if (href && !href.startsWith('http') && !href.startsWith('/')) {
                // Handle relative paths based on current directory level
                if (currentPath.includes('/features/') || currentPath.includes('/technologies/') || 
                    currentPath.includes('/how-it-works/') || currentPath.includes('/impact/')) {
                    // Remove ../ prefix for comparison
                    normalizedHref = href.replace('../', '');
                }
            }
            
            // Compare normalized paths
            const currentNormalizedPath = currentPath.replace(/^\//, '').replace(/\/$/, '');
            const linkNormalizedPath = normalizedHref.replace(/^\//, '').replace(/\/$/, '');
            
            if (currentNormalizedPath === linkNormalizedPath || 
                currentNormalizedPath.endsWith(linkNormalizedPath) ||
                (linkNormalizedPath === 'index.html' && (currentNormalizedPath === '' || currentNormalizedPath === 'index.html'))) {
                
                link.classList.add('active');
                
                // Handle parent dropdown
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const parentDropdownHeader = parentDropdown.querySelector('.dropdown-header');
                    if (parentDropdownHeader) {
                        parentDropdownHeader.classList.add('active');
                    }
                    
                    // Open the dropdown to show the active item
                    parentDropdown.classList.add('open');
                }
            }
        });
    }
}