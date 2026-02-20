import React from "react";

const T20 = () => {
    return( <div className="cc-rules">
    <div className="card m-b-10">
    <div className="card-header" style={{background:"#0f2462", color:"#fff"}}>
        <h6 className="card-title d-inline-block" style={{color:"#fff"}}>
            Rules
        </h6>
    </div>
    <div className="card-body" ><div className="table-responsive rules-table">
    <table className="table table-bordered rules-table">
        <thead>
            <tr>
                <th colSpan={2} className="box-10 text-center">Pair Plus</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="box-7">Pair (Double)</td>
                <td className="box-3">1 To 1</td>
            </tr>
        </tbody>
    </table>
    <table className="table table-bordered">
        <tbody>
            <tr>
                <td className="box-7">Flush (Color)</td>
                <td className="box-3">1 To 4</td>
            </tr>
        </tbody>
    </table>
    <table className="table table-bordered">
        <tbody>
            <tr>
                <td className="box-7">Straight (Rown)</td>
                <td className="box-3">1 To 6</td>
            </tr>
        </tbody>
    </table>
    <table className="table table-bordered">
        <tbody>
            <tr>
                <td className="box-7">Trio (Teen)</td>
                <td className="box-3">1 To 35</td>
            </tr>
        </tbody>
    </table>
    <table className="table table-bordered">
        <tbody>
            <tr>
                <td className="box-7">Straight Flush (Pakki Rown)</td>
                <td className="box-3">1 To 45</td>
            </tr>
        </tbody>
    </table>
</div></div></div></div>
);
}
export default React.memo(T20);