import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/styles/SinglePost.css";

function SinglePost({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    time: 15,
  });
  const [editService, setEditService] = useState(null);

  const durationOptions = Array.from({ length: 8 }, (_, i) => (i + 1) * 15);

  useEffect(() => {
    axios
      .get(`http://localhost:5001/categories/${id}`)
      .then((res) => setCategory(res.data))
      .catch(() => setCategory(null));

    fetchServices();
  }, [id]);

  const fetchServices = () => {
    axios
      .get(`http://localhost:5001/services/${id}`)
      .then((res) => setServices(res.data))
      .catch(() => setServices([]));
  };

  const handleAddService = (e) => {
    e.preventDefault();

    if (Number(newService.price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    axios
      .post(`http://localhost:5001/services`, {
        ...newService,
        category_id: id,
      })
      .then(() => {
        setShowForm(false);
        setNewService({ name: "", price: "", time: 15 });
        fetchServices();
      })
      .catch((err) => console.error("Error adding service:", err));
  };

  const handleEditService = (e) => {
    e.preventDefault();

    if (Number(editService.price) <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    axios
      .put(
        `http://localhost:5001/services/${editService.id}`,
        {
          name: editService.name,
          price: editService.price,
          time: editService.time,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then(() => {
        setEditService(null);
        fetchServices();
      })
      .catch((err) => console.error("Error updating service:", err));
  };

  const handleDeleteService = (serviceId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!confirmDelete) return;

    axios
      .delete(`http://localhost:5001/services/${serviceId}`)
      .then(() => {
        console.log(`Service ${serviceId} deleted successfully`);
        fetchServices();
      })
      .catch((err) =>
        console.error("Error deleting service:", err.response?.data || err)
      );
  };

  const handleBookClick = (service) => {
    navigate("/booking", { state: { service } });
  };

  if (!category) return <h1>Service not found</h1>;

  return (
    <div className="single-post">
      <h1 className="post-title">{category.name}</h1>

      <button onClick={() => navigate("/")} className="back-button">
        ← Back to Main Page
      </button>

      {category.image && (
        <img
          src={`http://localhost:5001/uploads/${category.image}`}
          alt={category.name}
          className="post-image"
        />
      )}

      <h2 className="service-header">Available Services</h2>

      {services.length > 0 ? (
        <ul className="service-list">
          {services.map((service) => (
            <li key={service.id} className="service-item">
              <div>
                <h3>{service.name}</h3>
                <p>Price: ₪{service.price}</p>
                <p>Time: {service.time} min</p>
              </div>
              <button
                className="appointment-btn"
                onClick={() => handleBookClick(service)}
              >
                Make an appointment
              </button>
              {user?.role === "Admin" && (
                <>
                  <button
                    className="edit-btn"
                    onClick={() => setEditService(service)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-services">No services found for this category.</p>
      )}

      {user?.role === "Admin" && (
        <>
          <button
            className="add-service-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "Add Service"}
          </button>

          {showForm && (
            <form className="add-service-form" onSubmit={handleAddService}>
              <input
                type="text"
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price (₪)"
                min="1"
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: e.target.value })
                }
                required
              />
              <select
                value={newService.time}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    time: parseInt(e.target.value),
                  })
                }
                required
              >
                {durationOptions.map((min) => (
                  <option key={min} value={min}>
                    {min < 60
                      ? `${min} minutes`
                      : min === 60
                      ? `1 hour`
                      : `${Math.floor(min / 60)} hour${
                          min % 60 ? ` ${min % 60}` : ""
                        }`}
                  </option>
                ))}
              </select>
              <button type="submit">Save Service</button>
            </form>
          )}

          {editService && (
            <form className="edit-service-form" onSubmit={handleEditService}>
              <h3>Edit Service</h3>
              <input
                type="text"
                placeholder="Service Name"
                value={editService.name}
                onChange={(e) =>
                  setEditService({ ...editService, name: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price (₪)"
                min="1"
                value={editService.price}
                onChange={(e) =>
                  setEditService({ ...editService, price: e.target.value })
                }
                required
              />
              <select
                value={editService.time}
                onChange={(e) =>
                  setEditService({
                    ...editService,
                    time: parseInt(e.target.value),
                  })
                }
                required
              >
                {durationOptions.map((min) => (
                  <option key={min} value={min}>
                    {min < 60
                      ? `${min} minutes`
                      : min === 60
                      ? `1 hour`
                      : `${Math.floor(min / 60)} hour${
                          min % 60 ? ` ${min % 60}` : ""
                        }`}
                  </option>
                ))}
              </select>
              <button type="submit" className="update-service-btn">
                Update Service
              </button>
              <button
                type="button"
                onClick={() => setEditService(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default SinglePost;
