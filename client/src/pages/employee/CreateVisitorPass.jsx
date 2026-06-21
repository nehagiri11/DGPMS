import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import FeedbackMessage from "../../components/FeedbackMessage";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";

import axios from "axios";
import {
  formatValidationMessage,
  isValidPhoneNumber,
  requiredText,
  todayDateString,
} from "../../utils/formValidation";
function CreateVisitorPass() {
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
  const [hostName, setHostName] =
  useState("");

const [hostDepartment, setHostDepartment] =
  useState("");

const [arrivalDate, setArrivalDate] =
  useState("");

const [departureDate, setDepartureDate] =
  useState("");


const [purpose, setPurpose] =
  useState("");

const [vehicleNo, setVehicleNo] =
  useState("");

const [employeeRemarks, setEmployeeRemarks] =
  useState("");

const [isSubmitting, setIsSubmitting] =
  useState(false);

const [feedback, setFeedback] =
  useState(null);

  const [visitors, setVisitors] = useState([
    {
      name: "",
      company: "",
      email: "",
      contact: "",
      photo: "",
    },
  ]);

  const addVisitor = () => {
    setVisitors([
      ...visitors,
      {
        name: "",
        company: "",
        email: "",
        contact: "",
        photo: "",
      },
    ]);
  };

  const removeVisitor = (index) => {
    setVisitors(
      visitors.filter((_, i) => i !== index)
    );
  };
  const updateVisitor = (
  index,
  field,
  value
) => {

  const updatedVisitors =
    [...visitors];

    updatedVisitors[index][field] =
    value;

   setVisitors(
    updatedVisitors
   );
 };

 const updateVisitorPhoto = (
  index,
  file
) => {
  if (!file) {
    updateVisitor(
      index,
      "photo",
      ""
    );
    return;
  }

  if (
    !file.type.startsWith("image/")
  ) {
    setFeedback({
      type: "error",
      message: "Please select a valid image file for the visitor photo."
    });
    return;
  }

  if (
    file.size >
    1024 * 1024
  ) {
    setFeedback({
      type: "error",
      message: "Visitor photo must be 1 MB or smaller."
    });
    return;
  }

  const reader =
    new FileReader();

  reader.onload = () => {
    updateVisitor(
      index,
      "photo",
      reader.result
    );
  };

  reader.readAsDataURL(
    file
  );
 };
  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setFeedback(null);

    const errors = [];

    if (!requiredText(hostName)) {
      errors.push("Host employee name is required.");
    }

    if (!requiredText(hostDepartment)) {
      errors.push("Host department is required.");
    }

    if (!requiredText(arrivalDate)) {
      errors.push("Arrival date is required.");
    }

    if (!requiredText(departureDate)) {
      errors.push("Departure date is required.");
    }

    if (!requiredText(purpose)) {
      errors.push("Purpose of visit is required.");
    }

    visitors.forEach((visitor, index) => {
      const rowNumber = index + 1;

      if (!requiredText(visitor.name)) {
        errors.push(`Visitor ${rowNumber}: name is required.`);
      }

      if (!requiredText(visitor.company)) {
        errors.push(`Visitor ${rowNumber}: company/organization is required.`);
      }

      if (!requiredText(visitor.email)) {
        errors.push(`Visitor ${rowNumber}: email address is required.`);
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          visitor.email.trim()
        )
      ) {
        errors.push(`Visitor ${rowNumber}: enter a valid email address.`);
      }

      if (!requiredText(visitor.contact)) {
        errors.push(`Visitor ${rowNumber}: contact number is required.`);
      } else if (
        !isValidPhoneNumber(
          visitor.contact
        )
      ) {
        errors.push(`Visitor ${rowNumber}: contact number must be 10 digits.`);
      }

      if (!visitor.photo) {
        errors.push(`Visitor ${rowNumber}: photo is required for the badge.`);
      }
    });

    const today =
      todayDateString();

    if (
      arrivalDate &&
      arrivalDate < today
    ) {
      errors.push("Arrival date cannot be before today.");
    }

    if (
      arrivalDate &&
      departureDate &&
      arrivalDate > departureDate
    ) {
      errors.push("Departure date must be the same as or after arrival date.");
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

  await axios.post(

    "/api/passes/visitor",

    {

      requester_id:
        loggedInUser.id,

      host_name:
        hostName,

      host_department:
        hostDepartment,

      arrival_date:
        arrivalDate,

      departure_date:
        departureDate,

      purpose,

      vehicle_no:
        vehicleNo,

      remarks:
        employeeRemarks,

      visitors

    },

    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }

  );

  showToast?.(
    "Visitor Pass Created",
    "success"
  );

  navigate(
  
     "/employee/requests"
);

} catch (error) {
  setFeedback({
    type: "error",
    message:
      error.response?.data?.message ||
      "Failed to create visitor pass"
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
            Create Visitor Pass (VIS)
          </h1>

          <div className="bg-white rounded-xl shadow p-8">

            <FeedbackMessage
              type={feedback?.type}
              message={feedback?.message}
            />

            <h2 className="text-xl font-bold mb-4">
              Visitor Details
            </h2>

            {visitors.map((visitor, index) => (

              <div
                key={index}
                className="border rounded-xl p-5 mb-5"
              >

                <div className="flex justify-between mb-4">

                  <h3 className="font-bold">
                    Visitor {index + 1}
                  </h3>

                  {visitors.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeVisitor(index)
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}

                </div>

                <div className="grid md:grid-cols-2 gap-4">

                  <input
                    placeholder="Visitor Name"
  value={visitor.name}
  onChange={(e) =>
  updateVisitor(
    index,
    "name",
    e.target.value
  )
}
  className="border rounded-lg p-3"
                  />

                  <input
                  
  placeholder="Company / Organization"
  value={visitor.company}
  onChange={(e) =>
    updateVisitor(
      index,
      "company",
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>
  
                  

                 <input
  type="email"
  placeholder="Email Address"
  value={visitor.email}
  onChange={(e) =>
    updateVisitor(
      index,
      "email",
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

                  <input
  type="tel"
  placeholder="Contact Number"
  value={visitor.contact}
  onChange={(e) =>
    updateVisitor(
      index,
      "contact",
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

                </div>

                <div className="mt-4 grid md:grid-cols-[120px_1fr] gap-4 items-center">
                  <div className="h-28 w-24 rounded-lg border bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 text-sm font-semibold">
                    {visitor.photo ? (
                      <img
                        src={visitor.photo}
                        alt={`${visitor.name || "Visitor"} preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "Photo"
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">
                      Visitor Photo
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateVisitorPhoto(
                          index,
                          e.target.files?.[0]
                        )
                      }
                      className="block w-full rounded-lg border p-3"
                    />

                    <p className="text-sm text-slate-500 mt-2">
                      Upload a clear front-facing photo. Maximum size: 1 MB.
                    </p>
                  </div>
                </div>

              </div>

            ))}

            <button
              type="button"
              onClick={addVisitor}
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              + Add Visitor
            </button>

            <h2 className="text-xl font-bold mt-10 mb-4">
              Host Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
               placeholder="Host Employee Name"
                value={hostName}
                onChange={(e) =>
                setHostName(e.target.value)
                }
                className="border rounded-lg p-3"
             />

              <input
  placeholder="Host Department"
  value={hostDepartment}
  onChange={(e) =>
    setHostDepartment(
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

            </div>

            <h2 className="text-xl font-bold mt-10 mb-4">
              Visit Schedule
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block mb-2">
                  Arrival Date
                </label>

               <input
  type="date"
  value={arrivalDate}
  onChange={(e) =>
    setArrivalDate(
      e.target.value
    )
  }
  className="border rounded-lg p-3 w-full"
/>
</div>

              <div>
                <label className="block mb-2">
                  Departure Date
                </label>

                <input
  type="date"
  value={departureDate}
  onChange={(e) =>
    setDepartureDate(
      e.target.value
    )
  }
  className="border rounded-lg p-3 w-full"
/>
</div>

            </div>

            <h2 className="text-xl font-bold mt-10 mb-4">
              Purpose Of Visit
            </h2>

            <select
  value={purpose}
  onChange={(e) =>
    setPurpose(
      e.target.value
    )
  }
  className="w-full border rounded-lg p-3"
>

              <option value="">
                Select Purpose
              </option>

              <option>Meeting</option>

              <option>Vendor Visit</option>

              <option>Audit</option>

              <option>Training</option>

              <option>Maintenance</option>

              <option>Delivery</option>

              <option>Interview</option>

              <option>Consultation</option>

              <option>Other</option>

            </select>

            <h2 className="text-xl font-bold mt-10 mb-4">
              Additional Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
  placeholder="Vehicle Number (Optional)"
  value={vehicleNo}
  onChange={(e) =>
    setVehicleNo(
      e.target.value
    )
  }
  className="border rounded-lg p-3"
/>

            

            </div>
            <textarea
  rows="4"
  value={employeeRemarks}
  onChange={(e) =>
    setEmployeeRemarks(
      e.target.value
    )
  }
  className="border rounded-lg p-3 w-full mt-4"
  placeholder="Remarks"
/>

            

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                mt-8
                bg-blue-700
                text-white
                px-8
                py-3
                rounded-lg
                hover:bg-blue-800
                disabled:opacity-60
                disabled:cursor-not-allowed
              `}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Visitor Pass"}
            </button>

          </div>

        </div>

      </div>

    </div>
  

  );
}

export default CreateVisitorPass;

