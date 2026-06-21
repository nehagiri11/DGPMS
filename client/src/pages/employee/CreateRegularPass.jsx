import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import FeedbackMessage from "../../components/FeedbackMessage";
import { useToast } from "../../components/ToastProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  formatValidationMessage,
  getItemValidationErrors,
  isValidPhoneNumber,
  requiredText,
} from "../../utils/formValidation";

function CreateRegularPass() {
  const [mobileOpen, setMobileOpen] =
  useState(false);
  const navigate = useNavigate();
  const showToast =
    useToast();
  const loggedInUser =
    JSON.parse(
      localStorage.getItem("loggedInUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    );
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

  const [category, setCategory] = useState("");
  const [companyName, setCompanyName] =
useState("");



const [driverName, setDriverName] =
useState("");

const [driverNumber, setDriverNumber] =
useState("");

const [vehicleNumber, setVehicleNumber] =
useState("");
const [entryTime, setEntryTime] =
  useState("");

const [exitTime, setExitTime] =
  useState("");
const [remarks, setRemarks] =
useState("");

const [isSubmitting, setIsSubmitting] =
  useState(false);

const [feedback, setFeedback] =
  useState(null);

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

    if (!requiredText(companyName)) {
      errors.push("Company name is required.");
    }

    if (!requiredText(driverName)) {
      errors.push("Driver name is required.");
    }

    if (!requiredText(driverNumber)) {
      errors.push("Driver number is required.");
    } else if (
      !isValidPhoneNumber(
        driverNumber
      )
    ) {
      errors.push("Driver number must be 10 digits.");
    }

    if (!requiredText(vehicleNumber)) {
      errors.push("Vehicle number is required.");
    }

    if (!requiredText(category)) {
      errors.push("Pass category is required.");
    }

    errors.push(
      ...getItemValidationErrors(
        items
      )
    );

    if (
      entryTime &&
      exitTime &&
      entryTime >= exitTime
    ) {
      errors.push("Exit time must be after entry time.");
    }

    if (errors.length > 0) {
      setFeedback({
        type: "error",
        message:
          formatValidationMessage(errors)
      });
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
          "/api/passes/regular",
          {
            requester_id:
              loggedInUser.id,
            company_name:
              companyName,
            driver_name:
              driverName,
            driver_number:
              driverNumber,
            vehicle_no:
              vehicleNumber,
            category,
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
      "Regular Gate Pass Submitted",
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
          "Failed to create regular pass"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex">

      <Sidebar role={loggedInUser?.role} 
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar role={loggedInUser?.role} 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-6">
            Regular Gate Pass (REG)
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

              <input
  placeholder="Company Name"
  value={companyName}
  onChange={(e) =>
    setCompanyName(
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

            </div>

            {/* Driver Information */}

            <h2 className="text-xl font-bold mt-8 mb-4">
              Driver Information
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              <input
  placeholder="Driver Name"
  value={driverName}
  onChange={(e) =>
    setDriverName(
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

              <input
  type="tel"
  placeholder="Driver Number"
  value={driverNumber}
  onChange={(e) =>
    setDriverNumber(
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

             <input
  placeholder="Vehicle Number"
  value={vehicleNumber}
  onChange={(e) =>
    setVehicleNumber(
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

            </div>

            {/* Category */}

            <h2 className="text-xl font-bold mt-8 mb-4">
              Pass Category
            </h2>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full border rounded-lg p-3"
            >
              <option value="">
                Select Category
              </option>

              <option value="Scrap">
                Scrap
              </option>

              <option value="Inventory">
                Inventory Items
              </option>

              <option value="Vehicle">
                Vehicle / Car
              </option>

              <option value="Assets">
                Assets
              </option>

              <option value="Others">
                Others
              </option>

            </select>

            {/* Material Details */}

            <h2 className="text-xl font-bold mt-8 mb-4">
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
  type="number"
  min="1"
  placeholder="Quantity"
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
    setRemarks(
      e.target.value
    )
  }
  className="w-full border rounded-lg p-3"
  placeholder="Additional Remarks"
/>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="
                mt-8
                bg-purple-600
                text-white
                px-8
                py-3
                rounded-lg
                hover:bg-purple-700
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Regular Gate Pass"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreateRegularPass;

