import React, { useEffect, useState } from 'react';
import './style.css';

export default function App() {
  const [searchInput, setSearchInput] = useState('');
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [customTotalItems, setCustomTotalItems] = useState(5);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const url = 'https://dummyjson.com/products';
      const response = await fetch(url);
      const json = await response.json();
      setProducts(json.products);
    } catch (error) {
      console.log("Error Fetching Products", error);
    }
  };

  const filterProducts = () => {
    return products.filter(product =>
      product.description.toLowerCase().includes(searchInput.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const calculateTotalPages = (filteredProducts) => {
    return Math.ceil(filteredProducts.length / totalItems);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleHeaderClick = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedProducts = () => {
    let sorted = [...filterProducts()];
    if (sortBy) {
      sorted = sorted.sort((a, b) => {
        const aValue = sortBy === 'stock' || sortBy === 'price'
          ? parseFloat(a[sortBy])
          : a[sortBy].toLowerCase();
        const bValue = sortBy === 'stock' || sortBy === 'price'
          ? parseFloat(b[sortBy])
          : b[sortBy].toLowerCase();
  
        // Compare strings using localeCompare for case-insensitive sorting
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
  
        // Compare numbers
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }
    return sorted;
  };  

  const handleCustomTotalItemsChange = (e) => {
    setCustomTotalItems(e.target.value);
  };

  const handleCustomTotalItemsBlur = () => {
    const customTotal = parseInt(customTotalItems);
    if (!isNaN(customTotal) && customTotal > 0) {
      setTotalItems(customTotal);
      setCurrentPage(1);
    }
  };

  const handleCustomTotalItemsKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCustomTotalItemsBlur();
    }
  };

  const handleArrowUpDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const incrementedValue = parseInt(customTotalItems) + 1;
      setCustomTotalItems(incrementedValue.toString());
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const decrementedValue = parseInt(customTotalItems) - 1;
      if (decrementedValue >= 1) {
        setCustomTotalItems(decrementedValue.toString());
      }
    }
  };

  const renderPaginationButtons = () => {
    const totalPages = calculateTotalPages(sortedProducts());
    const buttons = [];

    // Previous Button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        className={[`navigatorButtons${currentPage === 1 ? " disabled" : ""}`]}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    // Page Buttons
    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </button>
        );
      } else if (
        page === currentPage - 2 ||
        page === currentPage + 2
      ) {
        buttons.push(<span key={`ellipsis${page}`}>...</span>);
      }
    }

    // Next Button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        className={[`navigatorButtons${currentPage === totalPages ? " disabled" : ""}`]}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return buttons;
  };

  const renderTableHeaders = () => {
    const headers = ["description", "brand", "stock", "price"];
    return headers.map((header, index) => (
      <th key={index} onClick={() => handleHeaderClick(header)}>
        {header.charAt(0).toUpperCase() + header.slice(1)}
        {sortBy === header && (
          <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </th>
    ));
  };

  const renderTableRows = () => {
    const sorted = sortedProducts();
    return sorted
      .slice((currentPage - 1) * totalItems, currentPage * totalItems)
      .map((product, index) => (
        <tr key={index}>
          <td>{product.description}</td>
          <td>{product.brand}</td>
          <td>{product.stock}</td>
          <td>{product.price}</td>
        </tr>
      ));
  };

  const renderItemsRange = () => {
    const totalItemsCount = products.length;
    const sorted = sortedProducts();
    if (totalItemsCount === 0 || sorted.length === 0) {
      return "No entries to display";
    }

    const startItemIndex = (currentPage - 1) * totalItems + 1;
    const endItemIndex = Math.min(currentPage * totalItems, totalItemsCount);

    return `Showing ${startItemIndex} to ${endItemIndex} of ${totalItemsCount} entries`;
  };

  return (
    <div>
      <div className="flex card">
        <div>
          <label htmlFor="customTotalItems"> Show </label>
          <input
            type="number"
            className="numberInput"
            id="customTotalItems"
            value={customTotalItems}
            onChange={handleCustomTotalItemsChange}
            onBlur={handleCustomTotalItemsBlur}
            onKeyPress={handleCustomTotalItemsKeyPress}
            onKeyDown={handleArrowUpDown}
            min="1"
          />
          <label> entries </label>
        </div>
        <div className="flexCenter">
          <label htmlFor="search">Search: </label>
          <input
            id="search"
            type="search"
            value={searchInput}
            onChange={handleSearchInputChange}
            className="inputRight"
            placeholder="Search by description or brand"
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>{renderTableHeaders()}</tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
      <div className='flex'>
        <div>
          {renderItemsRange()}
        </div>
        <div className="pagination inputRight">{renderPaginationButtons()}</div>
      </div>
    </div>
  );
}
