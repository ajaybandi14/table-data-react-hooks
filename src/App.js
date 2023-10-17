import React, { useEffect, useState } from 'react';
import './style.css';

const headers = [{name: "Description", type: "description"}, {name: "Brand", type: "brand"}, {name: "Stock", type: "stock"}, {name: "Price", type: "price"}];

const searchableHeaders = ['description', 'brand', 'stock', 'price'];

const numericHeaders = ['stock', 'price'];

export default function App() {
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [customTotalItems, setCustomTotalItems] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = 'https://dummyjson.com/products';
      const response = await fetch(url);
      const json = await response.json();
      setData(json.products);
    } catch (error) {
      console.log("Error Fetching Products", error);
    }
  };

  const filterData = () => {
    if (!searchInput) {
      return data;
    }

    const sanitizedSearchInput = searchInput.toLowerCase();

    return data.filter((item) => searchableHeaders.some((column) => {
      const columnValue = String(item[column]).toLowerCase();
      return columnValue.includes(sanitizedSearchInput);
    }));
  };

  const calculateTotalPages = (filteredData) => {
    return Math.ceil(filteredData.length / totalItems);
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

  const sortedData = () => {
    let sorted = [...filterData()];
    if (sortBy) {
      sorted = sorted.sort((a, b) => {
        const aValue = numericHeaders.includes(sortBy)
          ? parseFloat(a[sortBy])
          : a[sortBy].toLowerCase();
        const bValue = numericHeaders.includes(sortBy)
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
    const totalPages = calculateTotalPages(sortedData());
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
    return headers.map((header, index) => (
      <th key={index} onClick={() => handleHeaderClick(header.type)}>
        {header.name}
        {sortBy === header.type && (
          <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </th>
    ));
  };

  const renderTableRows = () => {
    const sorted = sortedData();
    return sorted
      .slice((currentPage - 1) * totalItems, currentPage * totalItems)
      .map((item, index) => (
        <tr key={index}>
          <td>{item.description}</td>
          <td>{item.brand}</td>
          <td>{item.stock}</td>
          <td>{item.price}</td>
        </tr>
      ));
  };

  const renderItemsRange = () => {
    const totalItemsCount = data.length;
    const sorted = sortedData();
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
            onKeyUp={handleCustomTotalItemsBlur}
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
