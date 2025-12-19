import React, { useState } from 'react';
import "./Password.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import instance, { deleteAPassword, decryptThePass } from "../../axios/instance";

import { delPass } from "../../redux/actions";
import { useDispatch } from "react-redux";
//import axios from "axios";

function Password({ id, name, encryptedPassword, email, iv }) {
  const [show, setShow] = useState(false);
  const [decPassword, setDecPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editPlatform, setEditPlatform] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPass, setEditPass] = useState("");

  const dispatch = useDispatch();

  // Delete password
  const deletePassword = async () => {
    try {
      const res = await deleteAPassword({ id });
      if (res.status === 400) toast.error(res.data.error);
      else if (res.status === 200) {
        dispatch(delPass(id));
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete password.");
    }
  };

  // Decrypt password
  const decryptPassword = async () => {
    try {
      if (!show) {
        const res = await decryptThePass({ iv, encryptedPassword });
        if (res.status === 200) {
          setDecPassword(res.data.decrypted);
          setShow(true);
        }
      } else {
        setShow(false);
      }
    } catch (error) {
      console.log("decrypt error:", error.response?.data || error.message);
      toast.error("Error decrypting password.");
    }
  };

  // Update all fields
 const updatePassword = async () => {
  try {
    const res = await instance.put("/updatepassword", {
      id,
      platform: editPlatform,
      email: editEmail,
      userPass: editPass || decPassword,
    });

    if (res.status === 200) {
      toast.success("Password updated successfully!");
      setDecPassword(editPass || decPassword);
      setIsEditing(false);
    }
  } catch (err) {
    console.log(err);
    toast.error("Failed to update password.");
  }
};


  return (
    <div className="password">
      <ToastContainer />

      {!isEditing ? (
        <>
          <div className="password__header">
            <div className="password__left">
              <i className={`fab fa-${name.toLowerCase()}`}></i>
              <h3 className="password__name">{name}</h3>
            </div>
            <div className="password__actions">
              <FontAwesomeIcon
                className="edit__icon"
                icon={faPen}
                onClick={() => setIsEditing(true)}
                title="Edit password"
              />
              <FontAwesomeIcon
                className="delete__btn"
                icon={faTrash}
                onClick={deletePassword}
                title="Delete"
              />
            </div>
          </div>

          <div className="password__email">{email}</div>

          <div className="password__bottom">
            <input
              className="password__input"
              type={show ? "text" : "password"}
              value={decPassword}
              disabled
            />
            <FontAwesomeIcon
              icon={show ? faEyeSlash : faEye}
              onClick={decryptPassword}
              title={show ? "Hide password" : "Show password"}
            />
          </div>
        </>
      ) : (
        <div className="edit-section">
          <input
            type="text"
            value={editPlatform}
            onChange={(e) => setEditPlatform(e.target.value)}
            placeholder="Platform"
          />
          <input
            type="text"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="text"
            value={editPass}
            onChange={(e) => setEditPass(e.target.value)}
            placeholder="Password"
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={updatePassword}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Password;
