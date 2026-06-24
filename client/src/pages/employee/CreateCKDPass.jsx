import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import FeedbackMessage from "../../components/FeedbackMessage";
import { useToast } from "../../components/ToastProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  formatValidationMessage,
  getItemValidationErrors,
  isValidPhoneNumber,
  requiredText,
} from "../../utils/formValidation";
function CreateCKDPass() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const loggedInUser =
    JSON.parse(
      localStorage.getItem("loggedInUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    );
  const navigate = useNavigate();
  const showToast =
    useToast();
  const [companyName, setCompanyName] =
  useState("");
const [passDate] = useState(
  new Date().toISOString().split("T")[0]
);

const [passTime] = useState(
  new Date().toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )
);
const [driverName, setDriverName] =
  useState("");

const [driverNumber, setDriverNumber] =
  useState("");

const [truckNumber, setTruckNumber] =
  useState("");

const [sealNumber, setSealNumber] =
  useState("");

const [remarks, setRemarks] =
  useState("");

const [isSubmitting, setIsSubmitting] =
  useState(false);

const [feedback, setFeedback] =
  useState(null);
const [fieldErrors, setFieldErrors] =
  useState({});


  const [items, setItems] = useState([
    {
      itemDescription: "",
      quantity: "",
      remarks: "",
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        itemDescription: "",
        quantity: "",
        remarks: "",
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
  if (isSubmitting) {
    return;
  }

  setFeedback(null);

  const errors = [];
  const nextFieldErrors = {};

  if (!requiredText(companyName)) {
    nextFieldErrors.companyName =
      "Company name is required.";
  }

  if (!requiredText(driverName)) {
    nextFieldErrors.driverName =
      "Driver name is required.";
  }

  if (!requiredText(driverNumber)) {
    nextFieldErrors.driverNumber =
      "Driver number is required.";
  } else if (
    !isValidPhoneNumber(
      driverNumber
    )
  ) {
    nextFieldErrors.driverNumber =
      "Driver number must be exactly 10 digits.";
  }

  if (!requiredText(truckNumber)) {
    nextFieldErrors.truckNumber =
      "Truck number is required.";
  }

  if (!requiredText(sealNumber)) {
    nextFieldErrors.sealNumber =
      "Seal number is required.";
  }

  errors.push(
    ...getItemValidationErrors(
      items
    )
  );

  setFieldErrors(
    nextFieldErrors
  );

  if (
    errors.length > 0 ||
    Object.keys(nextFieldErrors).length > 0
  ) {
    setFeedback(
      errors.length > 0
        ? {
            type: "error",
            message:
              formatValidationMessage(errors)
          }
        : null
    );
    return;
  }
const token =
  localStorage.getItem("token");

if (!token || !loggedInUser?.id) {
  setFeedback({
    type: "error",
    message:
      "Please login again before creating a pass"
  });
  return;
}

try {
  setIsSubmitting(true);

  const response =
    await axios.post(
      "/api/passes/ckd",
      {
        requester_id:
          loggedInUser.id,
        company_name:
          companyName,
        driver_name:
          driverName,
        driver_number:
          driverNumber,
        truck_number:
          truckNumber,
        seal_number:
          sealNumber,
        remarks,
        items
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const savedPassNo =
    response.data.pass_no;

  if (
    loggedInUser?.role ===
    "APPROVER"
  ) {

    await axios.put(
      `/api/passes/${response.data.pass_id}/approve`,
      {
        approved_by:
          loggedInUser.id,
        remarks:
          "Created and approved by approver"
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }
    

    showToast?.(
      "CKD Gate Pass Submitted",
      "success"
    );

    navigate(
  loggedInUser?.role === "APPROVER"
    ? "/approver/approved"
    : "/employee/requests"
);

} catch (error) {
  setFeedback({
    type: "error",
    message:
      error.response?.data?.message ||
      "Failed to create CKD pass"
  });
} finally {
  setIsSubmitting(false);
}
  };

  return (
    <div className="flex">

      <Sidebar role={loggedInUser?.role}
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar role={loggedInUser?.role}  mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-6">
            CKD Consignment Gate Pass
          </h1>

          <div className="bg-white rounded-xl shadow p-8">

            <FeedbackMessage
              type={feedback?.type}
              message={feedback?.message}
            />

            {/* Gate Pass Information */}

            <h2 className="text-xl font-bold mb-4">
              Gate Pass Information
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              <input
  type="date"
  value={passDate}
  readOnly
  className="border rounded-lg p-3 bg-slate-100"
/>

<input
  type="text"
  value={passTime}
  readOnly
  className="border rounded-lg p-3 bg-slate-100"
/>

<div>
  <input
    placeholder="Company Name"
    value={companyName}
    onChange={(e) =>
      setCompanyName(e.target.value)
    }
    className={`border rounded-lg p-3 w-full ${
      fieldErrors.companyName
        ? "border-red-500"
        : ""
    }`}
  />
  {fieldErrors.companyName && (
    <p className="text-red-600 text-sm mt-1">
      {fieldErrors.companyName}
    </p>
  )}
</div>
            </div>

            {/* Driver Information */}

            <h2 className="text-xl font-bold mt-8 mb-4">
              Driver Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <input
                  placeholder="Driver Name"
                  value={driverName}
                  onChange={(e) =>
                    setDriverName(e.target.value)
                  }
                  className={`border rounded-lg p-3 w-full ${
                    fieldErrors.driverName
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {fieldErrors.driverName && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldErrors.driverName}
                  </p>
                )}
              </div>

<div>
  <input
    type="tel"
    placeholder="Driver Number"
    value={driverNumber}
    maxLength={10}
    onChange={(e) =>
      setDriverNumber(
        e.target.value.replace(
          /\D/g,
          ""
        ).slice(0, 10)
      )
    }
    className={`border rounded-lg p-3 w-full ${
      fieldErrors.driverNumber
        ? "border-red-500"
        : ""
    }`}
  />
  {fieldErrors.driverNumber && (
    <p className="text-red-600 text-sm mt-1">
      {fieldErrors.driverNumber}
    </p>
  )}
</div>

            </div>

            {/* Vehicle Information */}

            <h2 className="text-xl font-bold mt-8 mb-4">
              Vehicle Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <input
                  placeholder="Truck Number"
                  value={truckNumber}
                  onChange={(e)=>
                  setTruckNumber(
                  e.target.value
                  )
                  }
                  className={`border rounded-lg p-3 w-full ${
                    fieldErrors.truckNumber
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {fieldErrors.truckNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldErrors.truckNumber}
                  </p>
                )}
              </div>

              <div>
                <input
                  placeholder="Seal Number"
                  value={sealNumber}
                  onChange={(e) =>
                    setSealNumber(e.target.value)
                  }
                  className={`border rounded-lg p-3 w-full ${
                    fieldErrors.sealNumber
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {fieldErrors.sealNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldErrors.sealNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Material Details */}

            <h2 className="text-xl font-bold mt-10 mb-4">
              Material Details
            </h2>

            {items.map((item, index) => (

              <div
                key={index}
                className="border rounded-lg p-4 mb-4"
              >

                <div className="flex justify-between mb-3">

                  <h3 className="font-semibold">
                    Item {index + 1}
                  </h3>

                  {items.length > 1 && (

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(index)
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>

                  )}

                </div>

                <div className="grid md:grid-cols-3 gap-3">

                 <input
  placeholder="Item Description"
  value={item.itemDescription}
  onChange={(e) => {
    const updated = [...items];
    updated[index].itemDescription =
      e.target.value;
    setItems(updated);
  }}
  className="border rounded-lg p-3"
/>

                 <input
  type="text"
  placeholder="Quantity / Unit (e.g. 10 pcs)"
  value={item.quantity}
  onChange={(e) => {
    const updated = [...items];
    updated[index].quantity =
      e.target.value;
    setItems(updated);
  }}
  className="border rounded-lg p-3"
/>

                  <input
  placeholder="Remarks"
  value={item.remarks}
  onChange={(e) => {
    const updated = [...items];
    updated[index].remarks =
      e.target.value;
    setItems(updated);
  }}
  className="border rounded-lg p-3"
/>

                </div>

              </div>

            ))}

            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              + Add Item
            </button>

            {/* Remarks */}

            <h2 className="text-xl font-bold mt-8 mb-4">
              Remarks
            </h2>

            <textarea
  rows="4"
  value={remarks}
  onChange={(e) =>
    setRemarks(e.target.value)
  }
  className="w-full border rounded-lg p-3"
  placeholder="Additional Remarks"
/>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="
                mt-8
                bg-green-600
                text-white
                px-8
                py-3
                rounded-lg
                hover:bg-green-700
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit CKD Gate Pass"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreateCKDPass;

