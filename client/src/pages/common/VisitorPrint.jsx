import { QRCodeCanvas } from "qrcode.react";

function VisitorPrint({ request }) {
  const visitors =
    request.visitors?.length > 0
      ? request.visitors
      : [
          {
            name: "Visitor",
            company: request.companyName || "",
            contact: "",
          },
        ];

  const formatDisplayDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const parts = String(value).split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return value;
  };

  const getInitials = (name) =>
    String(name || "V")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "V";

  const getVisitorQrValue = (visitor) =>
    JSON.stringify({
      passNo: request.passNo,
      visitor: visitor.name,
    });

  const VisitorCard = ({ visitor }) => (
    <section className="visitor-pass-card">
      <header className="visitor-card-company">
        LAXMI MOTOR CORPORATION PVT. LTD
      </header>

      <div className="visitor-card-title">
        BUSINESS VISIT ENTRY
      </div>

      <div className="visitor-card-photo-band">
        <div className="visitor-card-photo border-2 border-white">
          {visitor.photo ? (
            <img
              src={visitor.photo}
              alt={visitor.name || "Visitor"}
            />
          ) : (
            <span>{getInitials(visitor.name)}</span>
          )}
        </div>
      </div>

      <div className="visitor-card-body">
        <div className="visitor-card-details">
          <p>
            <strong>Pass No:</strong> {request.passNo}
          </p>
          <p>
            <strong>Name:</strong> {visitor.name || "N/A"}
          </p>
          <p>
            <strong>Company:</strong> {visitor.company || "N/A"}
          </p>
          <p>
            <strong>Appr by:</strong> {request.approvedBy || "Pending"}
          </p>
          <p className="visitor-card-dates">
            <span>
              <strong>From:</strong> {formatDisplayDate(request.arrivalDate)}
            </span>
            <span>
              <strong>To:</strong> {formatDisplayDate(request.departureDate)}
            </span>
          </p>
        </div>

        <div className="visitor-card-qr">
          <QRCodeCanvas
            value={getVisitorQrValue(visitor)}
            size={72}
          />
        </div>

        <div className="visitor-card-footer">
          <div className="visitor-card-brandmark">
            <span>HYUNDAI</span>
            <span>LAXMI</span>
          </div>

          <div className="visitor-card-sign">
            Auth. Sign
          </div>
        </div>
      </div>
    </section>
  );

  const renderVisitorGatePass = (copyTitle) => (
    <section className="visitor-record-pass">
      <div className="flex justify-between items-start mb-4">
        <div className="text-center flex-1">
          <h1 className="font-bold text-xl">
            LAXMI MOTOR CORPORATION PVT. LTD
          </h1>
          <h2 className="font-bold">
            RAMGRAM-13, PARASI
          </h2>
          <h3 className="font-bold text-lg mt-2">
            VISITOR GATE PASS
          </h3>
          <p className="font-semibold">
            {copyTitle}
          </p>
        </div>

        <div className="relative -top-2 -left-2">
  <QRCodeCanvas
    value={request.passNo}
    size={86}
  />
</div>
      </div>

      <table className="w-full border-collapse border border-black">
        <tbody>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Date
            </td>
            <td className="border border-black p-2">
              {request.date}
            </td>
            <td className="border border-black p-2 font-semibold">
              Pass No
            </td>
            <td className="border border-black p-2">
              {request.passNo}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Host Name
            </td>
            <td className="border border-black p-2">
              {request.hostName}
            </td>
            <td className="border border-black p-2 font-semibold">
              Department
            </td>
            <td className="border border-black p-2">
              {request.hostDepartment}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Valid From
            </td>
            <td className="border border-black p-2">
              {request.arrivalDate}
            </td>
            <td className="border border-black p-2 font-semibold">
              Valid To
            </td>
            <td className="border border-black p-2">
              {request.departureDate}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">
              Purpose
            </td>
            <td
              colSpan="3"
              className="border border-black p-2"
            >
              {request.purpose || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse border border-black mt-4">
        <thead>
          <tr>
            <th className="border border-black p-2">
              S.N
            </th>
            <th className="border border-black p-2">
              Visitor Name
            </th>
            <th className="border border-black p-2">
              Company
            </th>
            <th className="border border-black p-2">
              Contact
            </th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor, index) => (
            <tr key={`${visitor.name || "record"}-${index}`}>
              <td className="border border-black p-2 text-center">
                {index + 1}
              </td>
              <td className="border border-black p-2">
                {visitor.name}
              </td>
              <td className="border border-black p-2">
                {visitor.company}
              </td>
              <td className="border border-black p-2">
                {visitor.contact}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-10 mt-16">
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

      <div className="text-center mt-12">
  <p className="text-xs font-semibold">
    This is a computer generated gate pass and does not require a signature.
  </p>
</div>
    </section>
  );

  return (
    <div className="visitor-print-page bg-white">
      <button
        onClick={() => window.print()}
        className="
          mb-5
          bg-blue-600
          text-white
          px-5
          py-2
          rounded
          print:hidden
        "
      >
        Print
      </button>

      <div className="visitor-card-sheet">
        {visitors.map((visitor, index) => (
          <VisitorCard
            key={`${visitor.name || "visitor"}-${index}`}
            visitor={visitor}
          />
        ))}
      </div>

      <div className="visitor-section-divider print:hidden">
        Visitor Gate Pass / Office Record
      </div>

      {renderVisitorGatePass("SECURITY COPY - 1")}

      <div className="visitor-record-cut-line cut-line border-t-2 border-dotted border-black my-4 relative">
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs font-semibold">
          Cut here
        </span>
      </div>

      {renderVisitorGatePass("OFFICE COPY - 2")}
    </div>
  );
}

export default VisitorPrint;
