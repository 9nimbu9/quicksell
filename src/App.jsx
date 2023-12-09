import React, { useState, useEffect } from 'react';
import './App.css'; 

const App = () => {
    const apiUrl = 'https://api.quicksell.co/v1/internal/frontend-assignment';

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);

    const [viewState, setViewState] = useState(() => {
        const storedViewState = localStorage.getItem('viewState');
        return storedViewState ? JSON.parse(storedViewState) : { groupingOption: 'status', sortingOption: 'priority' };
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                setTickets(data.tickets);
                setUsers(data.users);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []); 


    const [markedTickets, setMarkedTickets] = useState(() => {
        const storedMarkedTickets = localStorage.getItem('markedTickets');
        return storedMarkedTickets ? JSON.parse(storedMarkedTickets) : [];
    });

    const handleButtonClick = (ticketId) => {
        setMarkedTickets((prevMarkedTickets) => {
            const isTicketMarked = prevMarkedTickets.includes(ticketId);

            const updatedMarkedTickets = isTicketMarked
                ? prevMarkedTickets.filter((id) => id !== ticketId)
                : [...prevMarkedTickets, ticketId];

            localStorage.setItem('markedTickets', JSON.stringify(updatedMarkedTickets));

            return updatedMarkedTickets;
        });
    };


    const getGroupedAndSortedTickets = () => {
        let groupedTickets = {};

        tickets.forEach((ticket) => {
            let groupKey;
            if (viewState.groupingOption === 'userId') {
                const user = users.find((user) => user.id === ticket.userId);
                groupKey = user ? user.name : 'Unassigned';
            } else if (viewState.groupingOption === 'priority') {
                switch (ticket.priority) {
                    case 4:
                        groupKey = 'Urgent';
                        break;
                    case 3:
                        groupKey = 'High';
                        break;
                    case 2:
                        groupKey = 'Medium';
                        break;
                    case 1:
                        groupKey = 'Low';
                        break;
                    case 0:
                        groupKey = 'No Priority';
                        break;
                    default:
                        groupKey = 'Unknown Priority';
                }
            } else {
                groupKey = ticket[viewState.groupingOption];
            }

            if (!groupedTickets[groupKey]) {
                groupedTickets[groupKey] = [];
            }
            groupedTickets[groupKey].push(ticket);
        });

        Object.keys(groupedTickets).forEach((groupKey) => {
            groupedTickets[groupKey].sort((a, b) => {
                if (viewState.sortingOption === 'priority') {
                    return b.priority - a.priority;
                } else if (viewState.sortingOption === 'title') {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });
        });

        return groupedTickets;
    };

    const [displayOptions, setDisplayOptions] = useState(false);

    const toggleDisplayOptions = () => {
        setDisplayOptions(!displayOptions);
    };

    const handleSelectChange = () => {
        setDisplayOptions(false);
    };

    useEffect(() => {
        localStorage.setItem('viewState', JSON.stringify(viewState));
    }, [viewState]);


    return (
        <div>
            <div className="controls">
                <div className="dropdown-container">
                    <button className="dropdown-button" onClick={toggleDisplayOptions}>
                        Display &#9662;
                    </button>

                    {displayOptions && (
                        <div className="options-container">
                            <label htmlFor="groupingSelect" className='label-display'>Grouping</label>
                            <select
                                id="groupingSelect"
                                onChange={(e) => {
                                    setViewState({ ...viewState, groupingOption: e.target.value });
                                    handleSelectChange();
                                }}
                                value={viewState.groupingOption}
                            >
                                <option value="status">Status</option>
                                <option value="userId">User</option>
                                <option value="priority">Priority</option>
                            </select>
                            <br></br>
                            <label htmlFor="sortingSelect" className='label-display'>Ordering</label>
                            <select
                                id="sortingSelect"
                                onChange={(e) => {
                                    setViewState({ ...viewState, sortingOption: e.target.value });
                                    handleSelectChange();
                                }}
                                value={viewState.sortingOption}
                            >
                                <option value="priority">Priority</option>
                                <option value="title">Title</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="app-container">
                <div className="kanban-board">
                    {Object.entries(getGroupedAndSortedTickets()).map(([groupKey, groupTickets]) => (
                        <div key={groupKey} className="kanban-column">
                            <span className='column-name'>{groupKey} {groupTickets.length}</span>
                            {groupTickets.map((ticket) => (
                                <div key={ticket.id} className={`kanban-card ${markedTickets.includes(ticket.id) ? 'marked' : ''}`}>
                                    <span>{ticket.id}</span>
                                    <label className='rounded-checkbox'>
                                        <input
                                            type='checkbox'
                                            checked={markedTickets.includes(ticket.id)}
                                            onChange={() => handleButtonClick(ticket.id)}
                                        />
                                        <span className='checkmark'></span>
                                        <h3>{ticket.title}</h3>
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '3%' }}>
                                        <svg width="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 icon">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>

                                        <span style={{ marginLeft: '5px', }}>{ticket.tag[0]}</span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;
