
const OnedaypokerRules = () => {
    return( <div className="card m-b-10">
    <div className="card-header">
        <h6 className="card-title d-inline-block">
            Rules
        </h6>
    </div>
    <div className="card-body" >
        <table className="table table-bordered rules-table">
            <tbody>
                <tr className="text-center">
                    <th colSpan={2}>Bonus 1 (2 Cards Bonus)</th>
                </tr>
                <tr>
                    <td>Pair (2-10)</td>
                    <td>1 TO 3</td>
                </tr>   
                <tr>
                    <td>A/Q or A/J Off Suited</td>
                    <td>1 To 5</td>
                </tr>
                 
                <tr>
                    <td>Pair (JQK)</td>
                    <td>1 To 10</td>
                </tr>
                 
                <tr>
                    <td>A/K Off Suited</td>
                    <td>1 To 15</td>
                </tr>
                 
                <tr>
                    <td>A/Q or A/J Suited</td>
                    <td>1 To 20</td>
                </tr>
                 
                <tr>
                    <td>A/K Suited</td>
                    <td>1 To 25</td>
                </tr>
                 
                <tr>
                    <td>A/A</td>
                    <td>1 To 30</td>
                </tr>
                <tr className="text-center">
                    <th colSpan={2}>Bonus 2 (7 Cards Bonus)</th>
                </tr>
                <tr>
                    <td >Three of a Kind</td>
                    <td>1 TO 3</td>
                </tr>
                 
                <tr>
                    <td >Straight</td>
                    <td>1 To 4</td>
                </tr>
                 
                <tr>
                    <td >Flush</td>
                    <td>1 To 6</td>
                </tr>
                 
                <tr>
                    <td >Full House</td>
                    <td>1 To 8</td>
                </tr>
                 
                <tr>
                    <td >Four of a Kind</td>
                    <td>1 To 30</td>
                </tr>
                 
                <tr>
                    <td >Straight Flush</td>
                    <td>1 To 50</td>
                </tr>
                 
                <tr>
                    <td >Royal Flush</td>
                    <td>1 To 100</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>);
}
export default OnedaypokerRules;