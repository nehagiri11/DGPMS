import { QRCodeCanvas } from "qrcode.react";

function CKDPrint({ request }) {
  const formatTime = (value) => {
    const date =
      value ? new Date(value) : null;

    if (
      !date ||
      Number.isNaN(date.getTime())
    ) {
      return "-";
    }

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    );
  };

  const detailRow = (label, value) => (
  <div className="flex py-1 text-[12px]">
      <span className="font-semibold w-[120px] whitespace-nowrap text-[12px]">
        {label}
      </span>
      <span>
        : {value || "-"}
      </span>
    </div>
  );

  const renderCopy = (copyTitle, showSecurityFields) => (
    <section className="copy-section ckd-print-copy border-2 border-black flex flex-col p-4 pt-8">
      <div className="relative border-b border-black pb-5">
        <div className="absolute right-2 -top-2 bg-white p-1">
          <QRCodeCanvas
            value={request.passNo}
            size={76}
          />
        </div>

        <div className="text-center px-32 -mt-2">
          <h1 className="font-bold text-base leading-tight">
            LAXMI MOTOR CORPORATION PVT. LTD
          </h1>
          <h2 className="font-semibold text-sm leading-tight mt-1">
            RAMGRAM-13, PARASI
          </h2>
          <h3 className="font-bold text-base leading-tight mt-1">
            CKD GATE PASS (OUT)
          </h3>
          <p className="font-semibold text-[10px] mt-1">
            {copyTitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-14 border-b border-black py-3">
        <div>
          {detailRow("Company Name", request.companyName)}
          {detailRow("Driver Name", request.driverName)}
          {detailRow("Driver No", request.driverNumber)}
          {detailRow("Truck No", request.truckNumber)}
        </div>

        <div>
          {detailRow("Gate Pass No", request.passNo)}
          {detailRow("Date", request.date)}
          {detailRow("Time", formatTime(request.created_at))}
          {detailRow("Seal No", request.sealNumber)}
        </div>
      </div>

      <table className="w-full border-collapse border border-black mt-3 text-[11px]">
        <thead>
          <tr>
            <th className="border border-black p-2">
              S.N
            </th>
            <th className="border border-black p-2">
              ITEM/DESCRIPTION
            </th>
            <th className="border border-black p-2">
              QUANTITY
            </th>
            <th className="border border-black p-2">
              REMARKS
            </th>
          </tr>
        </thead>
        <tbody>
          {request.items?.map((item, index) => (
            <tr key={index}>
              <td className="border border-black p-2 text-center">
                {index + 1}
              </td>
              <td className="border border-black p-2">
                {item.itemDescription}
              </td>
              <td className="border border-black p-2">
                {item.quantity}
              </td>
              <td className="border border-black p-2">
                {item.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="remarks-box border border-black p-2 mt-3 min-h-[34px] text-[11px]">
        <strong>Remarks:</strong> {request.remarks || "-"}
      </div>

      <div className="h-2"></div>

      {showSecurityFields ? (
        <div className="grid grid-cols-3 gap-8 mt-2 items-end">
          <div>
            <p className="text-gray-500">
              Prepared By
            </p>
            <p className="print-person-name font-bold">
              {request.requester}
            </p>
          </div>
<div className="ml-8">
  <p className="text-gray-500">
    Approved By
  </p>
  <p className="print-person-name font-bold">
    {request.approvedBy || "Pending"}
  </p>
</div>

         <div className="ml-[90px]">
  <p className="font-semibold">
    Security Signature:
  </p>
  <p className="mt-3">
    Date:
  </p>
  <p className="mt-3">
    Time:
  </p>
</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8 mt-3 items-end">
          <div>
            <p className="text-gray-500">
              Prepared By
            </p>
            <p className="print-person-name font-bold">
              {request.requester}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500">
              Approved By
            </p>
            <p className="print-person-name font-bold">
              {request.approvedBy || "Pending"}
            </p>
          </div>
        </div>
      )}

      <div className="text-center mt-auto pt-1">
        <p className="generated-note text-[9px] font-medium text-slate-600">
          This is a computer generated gate pass and does not require a signature.
        </p>
      </div>
    </section>
  );

  return (
    <div className="print-container regular-ckd-print-container p-4 pt-10 bg-white">
      <button
        onClick={() => window.print()}
        className="
          mb-5
          bg-purple-600
          text-white
          px-5
          py-2
          rounded
          print:hidden
        "
      >
        Print
      </button>

      {renderCopy("SECURITY COPY - 1", true)}

      <div className="cut-line border-t-2 border-dotted border-black my-10 relative">
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs font-semibold">
          Cut here
        </span>
      </div>

      {renderCopy("OFFICE COPY - 2", false)}
    </div>
  );
}

export default CKDPrint;
