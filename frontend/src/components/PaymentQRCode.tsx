
const PaymentQRCode = ({ upiId, name, amount, transactionId } : any) => {
    // Construct the UPI payment URL
    const upiString = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&tn=${transactionId}&cu=INR`;
    const upi2 = `upi://pay?pa=rudhamsoftware@ibl&pn=318157&cu=INR&tn=Pay+to+318157&am=11&mc=4900&mode=04
&tr=EZV2024110120202019874354&td=EZV2024110120202019874354`
    // Encode the UPI string
    const encodedUPI = encodeURIComponent(upi2);

    // Construct the QR Code URL using QR Server API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=225x225&data=${encodedUPI}`;

    return (
        <div>
            <h2>Scan to Pay</h2>
            <img src={qrCodeUrl} alt="UPI Payment QR Code" />
        </div>
    );
};

export default PaymentQRCode;