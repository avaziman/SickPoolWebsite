import { useMemo } from "react";
import SortableTable, { ApiTableResult, Column, Sort } from "./SortableTable"

interface Server{
    endpoint: string,
    country: string,
}

const COLUMNS: Column[] = [
    {
        header: 'Country',
    },
    {
        header: 'Endpoint'
    },
]

function ShowEntry(server: Server) {
    
    return (
        <tr>
            <td>{server.country}</td>
            <td>{server.endpoint}</td>
        </tr>
    )
}

let servers: Server[] = [
    {
        country: 'Belgium',
        endpoint: 'eu.sickpool.io:4444'
    }
];

function LoadWorkers(_sort: Sort): Promise<ApiTableResult<Server>> {
    return Promise.resolve({
        result: {
            total: servers.length,
            entries: servers
        },
        error: null
    });
}

export default function GetStarted() {
    const columns = useMemo(() => COLUMNS, []);
    return (
        <div className="stats-container">
            <ol>
                <li>
                    Get your wallet address
                </li>
                <li>
                    Choose a mining server
                </li>
                <li>
                    Pick mining software
                </li>
            </ol>
            <p className="stats-title">Our stratum servers: </p>
            <SortableTable id="worker-table" columns={columns} showEntry={ShowEntry} loadTable={LoadWorkers} isPaginated={false} defaultSortBy=''/>

        </div>
    )
}