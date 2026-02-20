const Openteenpatti = () => {
    return( <div className="cc-rules">
    <div className="card m-b-10">
    <div className="card-header" style={{background:"#0f2462", color:"#fff"}}>
        <h6 className="card-title d-inline-block" style={{color:"#fff"}} >
            Rules
        </h6>
    </div>
    <div className="card-body" >
        <table className="table table-bordered rules-table">
            <tbody>
                <tr className="text-center">
                    <th colSpan={2}>Pair Plus</th>
                </tr>
                <tr>
                    <td width="60%">Pair (Double)</td>
                    <td>1 To 1</td>
                </tr>
                <tr>
                    <td width="60%">Flush (Color)</td>
                    <td>1 To 4</td>
                </tr>
                <tr>
                    <td width="60%">Straight (Rown)</td>
                    <td>1 To 6</td>
                </tr>
                <tr>
                    <td width="60%">Trio (Teen)</td>
                    <td>1 To 30</td>
                </tr>
                <tr>
                    <td width="60%">Straight Flush (Pakki Rown)</td>
                    <td>1 To 40</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</div>);
}
export default Openteenpatti;