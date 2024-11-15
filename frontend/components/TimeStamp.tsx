import React from 'react';

const TimestampToDate = ({ timestamp }: { timestamp: number }) => {
    const date = new Date(timestamp * 1000);

    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    console.log("Data", formattedDate);

    return (
        <div>
            {formattedDate}
        </div>
    );
};


export default TimestampToDate;