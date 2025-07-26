import React from 'react';
import './Card.css';

const Card = ({ title, value, icon }) => {
    return (
        <div className="summary-card">
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                <p className="card-value">{value}</p>
            </div>
        </div>
    );
};

export default Card;