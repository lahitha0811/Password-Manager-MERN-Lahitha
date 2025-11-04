import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router";
import Password from "../../Components/Password/Password";
import "./Passwords.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveNewPassword, deleteAPassword, checkAuthenticated } from "../../axios/instance";
import { useSelector, useDispatch } from "react-redux";
import { setAuth, setPasswords } from "../../redux/actions";

function Passwords() {
  const [platform, setPlatform] = useState("");
  const [platEmail, setPlatEmail] = useState("");
  const [platPass, setPlatPass] = useState("");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuthenticated, name, email, passwords } = useSelector((state) => state);

  const verifyUser = useCallback(async () => {
    try {
      const res = await checkAuthenticated();
      if (res.status === 200) {
        dispatch(setPasswords(res.data.passwords || []));
      } else {
        dispatch(setAuth(false));
      }
    } catch (err) {
      console.log(err);
      dispatch(setAuth(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace("/signin");
    } else {
      verifyUser();
    }
  }, [isAuthenticated, history, verifyUser]);

  const addNewPassword = async (e) => {
    e.preventDefault();
    try {
      const data = { platform, userPass: platPass, platEmail, userEmail: email };
      const res = await saveNewPassword(data);

      if (res.status === 200) {
        toast.success(res.data.message);
        dispatch(setPasswords(res.data.passwords || []));
        setOpen(false);
        setPlatform("");
        setPlatEmail("");
        setPlatPass("");
      } else {
        toast.error(res.data.error || "Could not add password");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to add password");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteAPassword({ id });
      if (res.status === 200) {
        toast.success(res.data.message);
        dispatch(setPasswords(res.data.passwords || []));
      } else {
        toast.error(res.data.error || "Could not delete password");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete password");
    }
  };

  // ✅ Filter passwords
  const filteredPasswords = passwords?.filter((p) =>
    p.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="passwords">
      <ToastContainer />

      <h1>
        Welcome <span className="name">{name}</span>
      </h1>

      {/* ✅ SEARCH BAR */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by platform..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ ADD NEW PASSWORD BUTTON */}
      <button className="modalButton" onClick={() => setOpen(true)}>
        Add New Password
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2>Add a new password</h2>
        <form className="form">
          <div className="form__inputs">
            <label htmlFor="platform">Platform</label>
            <input
              id="platform"
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="E.g. Facebook"
              required
            />
          </div>
          <div className="form__inputs">
            <label htmlFor="platEmail">Email</label>
            <input
              id="platEmail"
              type="email"
              value={platEmail}
              onChange={(e) => setPlatEmail(e.target.value)}
              placeholder="E.g. user@gmail.com"
              required
            />
          </div>
          <div className="form__inputs">
            <label htmlFor="platPass">Password</label>
            <input
              id="platPass"
              type="password"
              value={platPass}
              onChange={(e) => setPlatPass(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="button" onClick={addNewPassword}>
            Add
          </button>
        </form>
      </Modal>

      <hr />

      {/* ✅ PASSWORD LIST */}
      <div className="passwords__list">
        {filteredPasswords?.length > 0 ? (
          filteredPasswords.map((data) => (
            <Password
              key={data._id}
              id={data._id}
              name={data.platform}
              encryptedPassword={data.encryptedPassword || data.password}
              email={data.platEmail}
              iv={data.iv}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="nopass">
            <p>{searchTerm ? "No passwords found for this platform." : "You have not added any passwords yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Passwords;
