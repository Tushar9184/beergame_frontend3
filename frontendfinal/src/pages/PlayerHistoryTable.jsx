import React from 'react';

/**
 * Component to display the detailed 25-week history for the current player.
 */
export function PlayerHistoryTable({ data }) {
    if (!data || !data.weeks) return <p>No history data available.</p>;

    const tableRows = data.weeks.map((week, index) => ({
        week,
        ordersReceived: data.customerOrders[index],
        ordersPlaced: data.newOrderPlaced[index],
        // These are currently mocked, but would need to come from a proper 
        // GameTurn/History API endpoint in the final version.
        shipmentSent: data.shipmentSent[index], 
        shipmentReceived: data.shipmentReceived[index],
        inventory: data.inventory[index],
        backorder: data.backorder[index],
        weeklyCost: data.costs[index].toFixed(2),
        cumulativeCost: data.cumulativeCost[index].toFixed(2)
    }));

    return (
        <div className="history-table-wrapper">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Orders Rec.</th>
                        <th>Orders Placed</th>
                        <th>Shipment Rec.</th>
                        <th>Shipment Sent</th>
                        <th>Inv. End</th>
                        <th>Backorder End</th>
                        <th>Weekly Cost</th>
                        <th>Cum. Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows.map((row) => (
                        <tr key={row.week}>
                            <td>{row.week}</td>
                            <td>{row.ordersReceived}</td>
                            <td>{row.ordersPlaced}</td>
                            <td>{row.shipmentReceived}</td>
                            <td>{row.shipmentSent}</td>
                            <td>{row.inventory}</td>
                            <td>{row.backorder}</td>
                            <td>${row.weeklyCost}</td>
                            <td style={{fontWeight: 'bold'}}>${row.cumulativeCost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}