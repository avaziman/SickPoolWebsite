import { useEffect, useState } from "react";
const { REACT_APP_API_URL } = process.env;
// TODO: organize this shitshow
export default function SortableTable(props) {
    let [sort, setSort] = useState({ page: 0, limit: 10, by: props.defaultSortBy, dir: "desc" });
    let [error, setError] = useState(null);
    let [isLoading, setIsLoading] = useState(false);
    let [totalEntries, setTotalEntries] = useState(0);
    let [results, setResults] = useState([]);

    let urlParams = `?page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`;

    useEffect(() => {
        setIsLoading(true);
        fetch(`${REACT_APP_API_URL}/${props.section}/${props.entryName.toLowerCase()}s` + (props.isPaginated === true ? urlParams : `?address=${props.address}`))
            .then(res => res.json())
            .then(data => {
                setResults(data.result);
                setTotalEntries(data.total ? data.total : data.result.length);
                if (data.error) {
                    setError(`Failed to retrieve ${props.entryName.toLowerCase()}s (${data.error})`);
                    setResults([]);
                } else {
                    setError(null);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setResults([]);
                setError(`Failed to retrieve ${props.entryName.toLowerCase()}s`);
                setIsLoading(false);
            });
    }, [sort])

    function onTableHeaderClick(column) {
        if (!column) return;

        let dir = "desc";
        if (sort.by === column) {
            dir = sort.dir === "desc" ? "asc" : "desc";
        }

        setSort({
            page: 0, // reset the page count if the sortby changes
            limit: sort.limit,
            dir: dir,
            by: column
        });
    }

    function onLimitChange(e) {
        let newLimit = e.target.value;
        let newPage = sort.page;
        if (sort.page * sort.limit + newLimit > totalEntries) {
            newPage = Math.floor(totalEntries / newLimit);
        }
        setSort({
            page: newPage,
            limit: newLimit,
            dir: sort.dir,
            by: sort.by
        });
    }

    function onPageChange(e) {
        let newPage = e.target.value;
        setSort({
            page: newPage,
            limit: sort.limit,
            dir: sort.dir,
            by: sort.by
        });
    }

    return (
        <div>
            <div className="table-holder">
                <table id={props.id} className="sortable-table">
                    <thead>
                        <tr>
                            {props.columns.map(column => {
                                return (
                                    <th onClick={(e) => onTableHeaderClick(column.sortBy)}>
                                        {column.header} {sort.by && sort.by === column.sortBy && (sort.dir === "desc" ? "\u25be" : "\u25b4")}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <td className="loading" colSpan={props.columns.length}>Loading...</td>}
                        {!isLoading && !error && results && results.length == 0 && <td className="loading" colSpan={props.columns.length}>No {props.entryName}s found!</td>}
                        {error && <tr><td className="error" colSpan={props.columns.length}>{error} :(</td></tr>}
                        {
                            results && results.map((entry) => {
                                return props.showEntry(entry)
                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className="table-navigator">
                {props.isPaginated === true && <div className="table-navigator-left">
                    <span>{props.entryName}s per page: </span>
                    <select value={sort.limit} onChange={(e) => { onLimitChange(e); }}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                }
                {props.isPaginated === true && <div className="table-navigator-center">
                    <span>Page: </span>
                    <select value={sort.page} onChange={(e) => { onPageChange(e); }}>
                        {
                            totalEntries > 0 ?
                                //todo: check
                                Array.from(Array(Math.ceil(totalEntries / sort.limit)).keys())
                                    .map((pageIndex) => { return <option value={pageIndex}>{pageIndex + 1}</option>; })
                                : <option value="0">0</option>
                        }
                    </select>
                </div>
                }
                <div className="table-navigator-right">
                    <span>Showing {sort.limit * sort.page}-{Math.min(sort.limit * (+sort.page + 1), totalEntries)} of {totalEntries} {props.entryName.toLowerCase()}s</span>
                </div>
            </div>
        </div>
    )
}