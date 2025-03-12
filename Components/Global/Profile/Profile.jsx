import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

// INTERNAL IMPORT
import Header from "./Header";
import {
  DoctorDetails2,
  DoctorDetails1,
  DoctorDetails3,
  DoctorDetails4,
  DoctorDetails5,
  Profile1,
} from "../../SVG/index";
import {
  FaStethoscope,
  TiSocialTwitter,
  TiSocialFacebook,
  TiSocialLinkedin,
} from "../../ReactICON/index";
import { FaRegCopy } from "../../ReactICON/index";
import {
  SHORTEN_ADDRESS,
  CHECK_DOCTOR_REGISTERATION,
  GET_PATIENT_APPOINTMENT_HISTORYS,
} from "../../../Context/constants";
import Card from "./Card";

// Utility function to upload files to IPFS (Pinata)
const UPLOAD_IPFS_FILE = async (file) => {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: "585cd2c1d94c971bbfac", // Replace with your actual Pinata API key
          pinata_secret_api_key: "9fcd1836e8e834a0ea08534f4190bf1670a84f93a63ef56442721951e6778c69", // Replace with your actual Pinata secret API key
          "Content-Type": "multipart/form-data",
        },
      });

      // Check for successful response
      if (response.status === 200 && response.data.IpfsHash) {
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return fileUrl;  // Return the IPFS URL
      } else {
        throw new Error("Failed to pin file to IPFS");
      }
    } catch (error) {
      console.error("Error uploading file to IPFS", error);
      throw new Error("Error uploading file to IPFS");
    }
  } else {
    throw new Error("No file selected");
  }
};

const Profile = ({ user, setOpenComponent, setDoctorDetails }) => {
  const [doctor, setDoctor] = useState();
  const [patientAppoinment, setPatientAppoinment] = useState();
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [uploadedFileUrl, setUploadedFileUrl] = useState(""); // State for uploaded file URL

  // Notification function
  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });

  // Copy text to clipboard
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    notifySuccess("Copied successfully");
  };

  // Fetch doctor and patient appointment data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          CHECK_DOCTOR_REGISTERATION(user?.doctorAddress).then((doctor) => {
            setDoctor(doctor);
          });
          GET_PATIENT_APPOINTMENT_HISTORYS(user?.patientID).then((appointment) => {
            setPatientAppoinment(appointment);
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [user]);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle file upload to IPFS
  const handleFileUpload = async () => {
    if (selectedFile) {
      try {
        // Upload file to IPFS
        const fileUrl = await UPLOAD_IPFS_FILE(selectedFile);
        setUploadedFileUrl(fileUrl);
        toast.success("File uploaded successfully", { duration: 2000 });
      } catch (error) {
        toast.error("Error uploading file", { duration: 2000 });
      }
    } else {
      toast.error("No file selected", { duration: 2000 });
    }
  };

  return (
    <div className="container-fluid">
      <Header
        user={user}
        doctor={doctor}
        patientAppoinment={patientAppoinment}
      />
      <div className="row">
        {/* Profile Section */}
        <div className="col-xl-6 col-xxl-8">
          <div className="card">
            <div className="card-body">
              <div className="media d-sm-flex d-block text-center text-sm-start pb-4 mb-4 border-bottom">
                <img
                  alt="image"
                  className="rounded me-sm-4 me-0"
                  width={130}
                  src={user?.image}
                />
                <div className="media-body align-items-center">
                  <div className="d-sm-flex d-block justify-content-between my-3 my-sm-0">
                    <div>
                      <h3 className="fs-22 text-black font-w600 mb-0">
                        {user?.title} {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="mb-2 mb-sm-2">
                        {SHORTEN_ADDRESS(user?.walletAddress)}{" "}
                        <a onClick={() => copyText(user?.walletAddress)}>
                          <FaRegCopy />
                        </a>
                      </p>
                    </div>
                    <span>#P00-{user?.patientID}</span>
                  </div>
                  <a
                    href="javascript:void(0);"
                    className="btn btn-primary light btn-rounded mb-2 me-2"
                  >
                    <DoctorDetails1 />
                    {user?.gender}
                  </a>
                  <a
                    href="javascript:void(0);"
                    className="btn btn-primary light btn-rounded mb-2"
                  >
                    <DoctorDetails2 />
                    {user?.city}
                  </a>
                </div>
              </div>
              <div className="row">
                <Card icon={<DoctorDetails3 />} title={"Address"} name={user?.yourAddress} />
                <Card icon={<DoctorDetails4 />} title={"Phone"} name={user?.mobile} />
                <Card icon={<DoctorDetails5 />} title={"EmailID"} name={user?.emailID} />
                <Card icon={<DoctorDetails3 />} title={"Date of Birth "} name={user?.birth} />
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="col-xl-6 col-xxl-6">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="fs-20 font-w600">Upload Your Document</h4>
            </div>
            <div className="card-body">
              <input
                type="file"
                accept=".pdf, .doc, .docx, .png, .jpg, .jpeg" // Supported file types
                onChange={handleFileChange}
                className="form-control"
              />
              <button
                className="btn btn-primary mt-3"
                onClick={handleFileUpload}
              >
                Upload Document
              </button>

              {/* Display the uploaded file URL or image preview */}
              {uploadedFileUrl && (
                <div className="mt-3">
                  <p>Uploaded File:</p>
                  <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
                    {uploadedFileUrl}
                  </a>
                </div>
              )}

              {/* Image Preview */}
              {uploadedFileUrl && selectedFile?.type.startsWith("image/") && (
                <div className="mt-3">
                  <img src={uploadedFileUrl} alt="Uploaded Preview" width="200" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="col-xl-3 col-xxl-4 col-md-6">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="fs-20 font-w600">Medical History</h4>
            </div>
            <div className="card-body">
              <div className="widget-timeline-icon2">
                <ul className="timeline">
                  {user?.medicalHistory?.map((item, index) => (
                    <li key={index}>
                      <div className="icon bg-primary">
                        <i className="las">
                          <FaStethoscope />
                        </i>
                      </div>
                      <a className="timeline-panel text-muted" href="javascript:void(0);">
                        <h4 className="mb-2 mt-1">{item}</h4>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Doctor Section */}
        <div className="col-xl-6 col-xxl-6">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h4 className="fs-20 font-w600">Assigned Doctor</h4>
            </div>
            <div className="card-body">
              <div className="media d-sm-flex text-sm-start d-block text-center">
                <img
                  alt="image"
                  className="rounded me-sm-4 me-0 mb-2 mb-sm-0"
                  width={130}
                  src={doctor?.image}
                />
                <div className="media-body">
                  <h3 className="fs-22 text-black font-w600 mb-0">
                    Dr.{doctor?.title} {doctor?.firstName} {doctor?.lastName}
                  </h3>
                  <p className="text-primary">{doctor?.specialization}</p>
                  <div className="social-media mb-sm-0 mb-3 justify-content-sm-start justify-content-center">
                    <a>
                      <i className="lab ms-0">
                        <TiSocialTwitter />
                      </i>
                    </a>
                    <a>
                      <i className="lab">
                        <TiSocialLinkedin />
                      </i>
                    </a>
                    <a>
                      <i className="lab">
                        <TiSocialFacebook />
                      </i>
                    </a>
                  </div>
                </div>
                <div className="text-center">
                  <span
                    onClick={() => (
                      setDoctorDetails(doctor),
                      setOpenComponent("DoctorDetails")
                    )}
                    className="num"
                  >
                    View
                  </span>
                </div>
              </div>
              <p>{doctor?.biography.slice(0, 300)}..</p>
            </div>
          </div>
        </div>

      
          {/* About Section */}
          <div className="col-xl-6 col-xxl-6">
          <div className="card patient-detail">
            <div className="card-header border-0 pb-0">
              <h4 className="fs-20 font-w600 text-white">
                About {user?.title} {user?.firstName} {user?.lastName}
              </h4>
              <a href="javascript:void(0);">
                <Profile1 />
              </a>
            </div>
            <div className="card-body fs-14 font-w300">{user?.message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


// MY CODE
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";

// //INTERNAL IMPORT
// import Header from "./Header";
// import {
//   DoctorDetails2,
//   DoctorDetails1,
//   DoctorDetails3,
//   DoctorDetails4,
//   DoctorDetails5,
//   Profile1,
// } from "../../SVG/index";
// import {
//   FaStethoscope,
//   TiSocialTwitter,
//   TiSocialFacebook,
//   TiSocialLinkedin,
// } from "../../ReactICON/index";
// import { FaRegCopy } from "../../ReactICON/index";
// import {
//   SHORTEN_ADDRESS,
//   CHECK_DOCTOR_REGISTERATION,
//   GET_PATIENT_APPOINTMENT,
//   GET_PATIENT_APPOINTMENT_HISTORYS,
// } from "../../../Context/constants";
// import Card from "./Card";

// const Profile = ({ user, setOpenComponent, setDoctorDetails }) => {
//   const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
//   const [doctor, setDoctor] = useState();
//   const [patientAppoinment, setPatientAppoinment] = useState();
//   const [ehrFile, setEhrFile] = useState(null); // EHR file state
//   const [ehrFileUrl, setEhrFileUrl] = useState(null); // URL for viewing the EHR file
//   const [accessRequests, setAccessRequests] = useState([]); // Pending access requests

//   const copyText = (text) => {
//     navigator.clipboard.writeText(text);
//     notifySuccess("Copied successfully");
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setEhrFile(file);
//       const fileUrl = URL.createObjectURL(file); // Generate URL for local file preview
//       setEhrFileUrl(fileUrl);
//       notifySuccess("File selected successfully.");
//     }
//   };

//   const handleUpload = () => {
//     if (!ehrFile) {
//       notifySuccess("Please select a file to upload.");
//       return;
//     }
//     // Simulate file upload to IPFS (replace with actual logic)
//     // After uploading, the EHR should be stored in IPFS and linked to the blockchain.
//     notifySuccess("EHR uploaded successfully.");
//     // Add code to handle the file upload to IPFS and blockchain interaction here.
//   };

//   const handleAccessRequest = (doctorAddress) => {
//     // Simulate receiving access request (replace with actual logic)
//     setAccessRequests((prev) => [...prev, { doctorAddress, status: "Pending" }]);
//   };

//   const handleGrantAccess = (doctorAddress) => {
//     // Grant access to the doctor
//     setAccessRequests((prev) =>
//       prev.map((request) =>
//         request.doctorAddress === doctorAddress
//           ? { ...request, status: "Granted" }
//           : request
//       )
//     );
//     notifySuccess(Access granted to doctor: ${doctorAddress});
//     // Add blockchain interaction here to record access.
//   };

//   const handleDenyAccess = (doctorAddress) => {
//     // Deny access to the doctor
//     setAccessRequests((prev) =>
//       prev.filter((request) => request.doctorAddress !== doctorAddress)
//     );
//     notifySuccess(Access denied to doctor: ${doctorAddress});
//     // Add blockchain interaction here to revoke access.
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (user) {
//           CHECK_DOCTOR_REGISTERATION(user?.doctorAddress).then((doctor) => {
//             setDoctor(doctor);
//           });
//           GET_PATIENT_APPOINTMENT_HISTORYS(user?.patientID).then(
//             (appoinment) => {
//               setPatientAppoinment(appoinment);
//             }
//           );
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchData();
//   }, [user]);

//   return (
//     <div className="container-fluid">
//       <Header
//         user={user}
//         doctor={doctor}
//         patientAppoinment={patientAppoinment}
//       />
//       <div className="row">
//         {/* Patient Details Section */}
//         <div className="col-xl-6 col-xxl-8">
//           <div className="card">
//             <div className="card-body">
//               <div className="media d-sm-flex d-block text-center text-sm-start pb-4 mb-4 border-bottom">
//                 <img
//                   alt="image"
//                   className="rounded me-sm-4 me-0"
//                   width={130}
//                   src={user?.image}
//                 />
//                 <div className="media-body align-items-center">
//                   <div className="d-sm-flex d-block justify-content-between my-3 my-sm-0">
//                     <div>
//                       <h3 className="fs-22 text-black font-w600 mb-0">
//                         {user?.title} {user?.firstName} {user?.lastName}
//                       </h3>
//                       <p className="mb-2 mb-sm-2">
//                         {SHORTEN_ADDRESS(user?.walletAddress)}{" "}
//                         <a onClick={() => copyText(user?.walletAddress)}>
//                           {" "}
//                           <FaRegCopy />
//                         </a>
//                       </p>
//                     </div>
//                     <span>#P00-{user?.patientID}</span>
//                   </div>
//                   <a
//                     href="javascript:void(0);"
//                     className="btn btn-primary light btn-rounded mb-2 me-2"
//                   >
//                     <DoctorDetails1 />
//                     {user?.gender}
//                   </a>
//                   <a
//                     href="javascript:void(0);"
//                     className="btn btn-primary light btn-rounded mb-2"
//                   >
//                     <DoctorDetails2 />
//                     {user?.city}
//                   </a>
//                 </div>
//               </div>

//               {/* EHR Upload Section */}
//               <div className="mb-4">
//                 <h4 className="fs-20 font-w600">Upload EHR</h4>
//                 <input
//                   type="file"
//                   accept=".pdf,.docx,.png,.jpg,.jpeg"
//                   onChange={handleFileUpload}
//                 />
//                 <button
//                   className="btn btn-primary light btn-rounded mb-2"
//                   onClick={handleUpload}
//                 >
//                   Upload EHR
//                 </button>
//                 {ehrFileUrl && (
//                   <div className="mt-3">
//                     <a href={ehrFileUrl} target="_blank" rel="noopener noreferrer">
//                       <button className="btn btn-success light btn-rounded">
//                         View Uploaded EHR
//                       </button>
//                     </a>
//                   </div>
//                 )}
//               </div>

//               {/* Access Request Section */}
//               <div className="mb-4">
//                 <h4 className="fs-20 font-w600">Access Requests</h4>
//                 {accessRequests.length === 0 ? (
//                   <p>No pending requests.</p>
//                 ) : (
//                   <ul>
//                     {accessRequests.map((request, index) => (
//                       <li key={index}>
//                         Doctor Address: {request.doctorAddress} - Status:{" "}
//                         {request.status}{" "}
//                         {request.status === "Pending" && (
//                           <>
//                             <button
//                               className="btn btn-success"
//                               onClick={() => handleGrantAccess(request.doctorAddress)}
//                             >
//                               Grant Access
//                             </button>
//                             <button
//                               className="btn btn-danger"
//                               onClick={() => handleDenyAccess(request.doctorAddress)}
//                             >
//                               Deny Access
//                             </button>
//                           </>
//                         )}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Assigned Doctor and Medical History Section */}
//         <div className="col-xl-6 col-xxl-6">
//           <div className="card">
//             <div className="card-header border-0 pb-0">
//               <h4 className="fs-20 font-w600">Assigned Doctor</h4>
//             </div>
//             <div className="card-body">
//               <div className="media d-sm-flex text-sm-start d-block text-center">
//                 <img
//                   alt="image"
//                   className="rounded me-sm-4 me-0 mb-2 mb-sm-0"
//                   width={130}
//                   src={doctor?.image}
//                 />
//                 <div className="media-body">
//                   <h3 className="fs-22 text-black font-w600 mb-0">
//                     Dr.{doctor?.title} {doctor?.firstName} {doctor?.lastName}
//                   </h3>
//                   <p className="text-primary">{doctor?.specialization}</p>
//                   <div className="social-media mb-sm-0 mb-3 justify-content-sm-start justify-content-center">
//                     <a>
//                       <i className="lab ms-0">
//                         <TiSocialTwitter />
//                       </i>
//                     </a>
//                     <a>
//                       <i className="lab ">
//                         <TiSocialLinkedin />
//                       </i>
//                     </a>
//                     <a>
//                       <i className="lab">
//                         <TiSocialFacebook />
//                       </i>
//                     </a>
//                   </div>
//                 </div>
//                 <div className="text-center">
//                   <span
//                     onClick={() => (
//                       setDoctorDetails(doctor),
//                       setOpenComponent("DoctorDetails")
//                     )}
//                     className="num"
//                   >
//                     View
//                   </span>
//                 </div>
//               </div>
//               <p>{doctor?.biography.slice(0, 300)}..</p>
//             </div>
//           </div>
//         </div>

//         {/* Medical History Section */}
//         <div className="col-xl-6 col-xxl-6">
//           <div className="card">
//             <div className="card-header border-0 pb-0">
//               <h4 className="fs-20 font-w600">Medical History</h4>
//             </div>
//             <div className="card-body">
//               <div className="widget-timeline-icon2">
//                 <ul className="timeline">
//                   {user?.medicalHistory
//                     ?.map((item, index) => (
//                       <li key={index}>
//                         <div className="icon bg-primary">
//                           <i className="las">
//                             <FaStethoscope />
//                           </i>
//                         </div>
//                         <a
//                           className="timeline-panel text-muted"
//                           href="javascript:void(0);"
//                         >
//                           <h4 className="mb-2 mt-1">{item}</h4>
//                         </a>
//                       </li>
//                     ))
//                     .slice(0, 3)}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Profile;