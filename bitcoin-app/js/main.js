// DOM Elements
const cryptoList = document.getElementById('crypto-list');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const pagination = document.getElementById('pagination');

// Configuration
const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let allCryptos = [];
let filteredCryptos = [];

// Fetch cryptocurrency data from CoinGecko API
async function fetchCryptoData() {
    try {
        // Show loading state
        cryptoList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Fetch top 100 cryptocurrencies
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allCryptos = data;
        filteredCryptos = [...allCryptos];
        renderCryptos();
    } catch (error) {
        console.error('Error fetching cryptocurrency ', error);
        cryptoList.innerHTML = '<div class="no-results">Failed to load cryptocurrency data. Please try again later.</div>';
    }
}

// Render cryptocurrency cards
function renderCryptos() {
    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const cryptosToShow = filteredCryptos.slice(startIndex, endIndex);
    
    // Clear the list
    cryptoList.innerHTML = '';
    
    if (cryptosToShow.length === 0) {
        cryptoList.innerHTML = '<div class="no-results">No cryptocurrencies found matching your search.</div>';
        pagination.innerHTML = '';
        return;
    }
    
    // Render each cryptocurrency
    cryptosToShow.forEach(crypto => {
        const card = document.createElement('div');
        card.className = 'crypto-card';
        
        // Format large numbers
        const marketCap = formatLargeNumber(crypto.market_cap);
        const volume = formatLargeNumber(crypto.total_volume);
        
        card.innerHTML = `
            <div class="crypto-header">
                <div class="crypto-icon">${crypto.name.charAt(0)}</div>
                <div class="crypto-name">${crypto.name} <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span></div>
            </div>
            <div class="crypto-price">$${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                <i class="${crypto.price_change_percentage_24h >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}"></i>
                ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
            </div>
            <div class="crypto-stats">
                <div class="stat-item">
                    <div class="stat-label">Market Cap</div>
                    <div class="stat-value">$${marketCap}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Volume (24h)</div>
                    <div class="stat-value">$${volume}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Circulating</div>
                    <div class="stat-value">${formatLargeNumber(crypto.circulating_supply)} ${crypto.symbol.toUpperCase()}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Rank</div>
                    <div class="stat-value">#${crypto.market_cap_rank}</div>
                </div>
            </div>
        `;
        
        cryptoList.appendChild(card);
    });
    
    // Render pagination
    renderPagination();
}

// Format large numbers (e.g., 1,000,000 -> 1M)
function formatLargeNumber(num) {
    if (num >= 1e12) {
        return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
        return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
        return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
        return `$${(num / 1e3).toFixed(2)}K`;
    } else {
        return `$${num?.toLocaleString() || 'N/A'}`;
    }
}

// Render pagination controls
function renderPagination() {
    const totalPages = Math.ceil(filteredCryptos.length / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll('.page-btn:not(#prev-page):not(#next-page)').forEach(button => {
        button.addEventListener('click', () => {
            currentPage = parseInt(button.getAttribute('data-page'));
            renderCryptos();
        });
    });
    
    // Previous page button
    const prevButton = document.getElementById('prev-page');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCryptos();
            }
        });
    }
    
    // Next page button
    const nextButton = document.getElementById('next-page');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredCryptos.length / ITEMS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderCryptos();
            }
        });
    }
}

// Filter cryptocurrencies based on search input
function filterCryptos() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        filteredCryptos = [...allCryptos];
    } else {
        filteredCryptos = allCryptos.filter(crypto => 
            crypto.name.toLowerCase().includes(searchTerm) || 
            crypto.symbol.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderCryptos();
}

// Initialize the application
async function init() {
    // Initial data fetch
    await fetchCryptoData();
    
    // Set up search functionality
    searchBtn.addEventListener('click', filterCryptos);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterCryptos();
        }
    });
    
    // Set up refresh functionality
    refreshBtn.addEventListener('click', fetchCryptoData);
    
    // Set up periodic updates (every 5 minutes)
    setInterval(fetchCryptoData, 300000);
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', init);