import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import VisitorPrint from "./VisitorPrint";
import CKDPrint from "./CKDPrint";
import RegularPrint from "./RegularPrint";
import { mapApiPass } from "../../utils/passMapper";

function PrintPass() {

  const { passNo } = useParams();

  const [request, setRequest] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadPass = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await axios.get(
            `/api/passes/verify/${passNo}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setRequest(
          mapApiPass(response.data.pass)
        );

      } catch (error) {

        setRequest(null);

      } finally {

        setLoading(false);

      }

    };

    loadPass();

  }, [passNo]);

  if (loading) {
    return (
      <div className="p-10">
        Loading Pass...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-10">
        Pass Not Found
      </div>
    );
  }

  if (request.type === "Visitor") {
    return <VisitorPrint request={request} />;
  }

  if (request.type === "CKD") {
    return <CKDPrint request={request} />;
  }

  return <RegularPrint request={request} />;
}

export default PrintPass;

