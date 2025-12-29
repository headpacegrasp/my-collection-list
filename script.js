document.addEventListener('DOMContentLoaded', () => {
    let allData = []; // This will hold your parsed data.json

    // Function to fetch and load data
    async function loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            allData = data;
            displayCategories(allData);
            displayItems(allData.flatMap(cat => cat.items)); // Display all items initially
            populateCategoryDropdown(allData);
        } catch (error) {
            console.error('Error loading data:', error);
            // Handle error, e.g., display a message to the user
        }
    }

    // Function to display category cards
    function displayCategories(data) {
        const categoryCardsContainer = document.getElementById('category-cards');
        categoryCardsContainer.innerHTML = ''; // Clear existing cards
        data.forEach(category => {
            const card = document.createElement('div');
            card.classList.add('category-card');
            card.textContent = category.category;
            card.addEventListener('click', () => filterByCategory(category.category));
            categoryCardsContainer.appendChild(card);
        });
    }

    // Function to display items
    function displayItems(items) {
        const itemListContainer = document.getElementById('item-list');
        itemListContainer.innerHTML = ''; // Clear existing items
        if (items.length === 0) {
            itemListContainer.innerHTML = '<p>No items found.</p>';
            return;
        }
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('tool-item');
            const description = item.description ? `<p>${item.description}</p>` : '';
            const urls = item.url ? item.url.split(' | ').map(u => {
                let displayUrl = u;
                let actualUrl = u;
                // Basic attempt to make URL clickable if it looks like one
                if (!u.startsWith('http://') && !u.startsWith('https://') && u.includes('.')) {
                    actualUrl = `https://${u}`; // Assume https for simplicity, or add more robust parsing
                }
                if (u.includes('http')) {
                   return `<a href="${actualUrl}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
                }
                return displayUrl;
            }).join(', ') : 'No URL provided';

            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                ${description}
                <p><strong>Link(s):</strong> ${urls}</p>
            `;
            itemListContainer.appendChild(itemElement);
        });
    }

    // Function to filter by category
    function filterByCategory(categoryName) {
        const selectedCategory = allData.find(cat => cat.category === categoryName);
        if (selectedCategory) {
            displayItems(selectedCategory.items);
        } else {
            displayItems([]); // No items if category not found
        }
    }

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredItems = allData.flatMap(category =>
            category.items.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                category.category.toLowerCase().includes(searchTerm)
            )
        );
        displayItems(filteredItems);
    });

    // --- Add New Item Form Logic ---
    function populateCategoryDropdown(data) {
        const dropdown = document.getElementById('itemCategory');
        dropdown.innerHTML = '<option value="">--Select Category--</option>'; // Default option
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category;
            option.textContent = category.category;
            dropdown.appendChild(option);
        });
    }

    document.getElementById('addItemForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const category = document.getElementById('itemCategory').value;
        const name = document.getElementById('itemName').value;
        const description = document.getElementById('itemDescription').value;
        const url = document.getElementById('itemUrl').value;

        const newItem = {
            "name": name,
            "description": description || null,
            "url": url
        };

        const existingCategory = allData.find(cat => cat.category === category);
        let outputText = '';
        if (existingCategory) {
            // If category exists, add item to its array. This is just for display to the user.
            // The actual change needs to be made in the data.json file.
            outputText = JSON.stringify(newItem, null, 2);
        } else {
            // If new category, create a new category structure.
            const newCategoryStructure = {
                "category": category,
                "items": [newItem]
            };
            outputText = JSON.stringify(newCategoryStructure, null, 2);
        }

        document.getElementById('outputJson').value = outputText;
        document.getElementById('generatedItemData').style.display = 'block';
    });

    window.copyToClipboard = function() {
        const outputJson = document.getElementById('outputJson');
        outputJson.select();
        document.execCommand('copy');
        alert('JSON data copied to clipboard!');
    };

    loadData(); // Initial data load
});
