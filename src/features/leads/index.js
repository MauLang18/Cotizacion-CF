import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import { useDispatch } from "react-redux";

function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filter, setFilter] = useState("0");
  const [textFilter, setTextFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Inicializar como falso
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    quo: "",
    cotizacion: null,
    cliente: "",
    estado: 0,
  });
  const dispatch = useDispatch();

  // Decodificar token y establecer permisos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const givenName = decodedToken.given_name;
        setIsAdmin(givenName === "1"); // Mostrar botón solo si givenName es "1"
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAdmin(false);
      }
    }
  }, []);

  // Obtener cotizaciones
  const fetchCotizaciones = async (filterValue, textValue) => {
    try {
      const response = await fetch(
        `https://api.logisticacastrofallas.com/api/Cotizacion?numFilter=${filterValue}&textFilter=${textValue}`
      );
      const data = await response.json();
      if (data.isSuccess) {
        setCotizaciones(data.data.value);
      } else {
        dispatch(showNotification({ message: data.message, type: "error" }));
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error fetching cotizaciones",
          type: "error",
        })
      );
    }
  };

  useEffect(() => {
    fetchCotizaciones(filter, textFilter);
  }, [filter, textFilter]);

  // Manejo de filtros
  const handleFilterChange = (e) => setFilter(e.target.value);
  const handleTextFilterChange = (e) => setTextFilter(e.target.value);

  // Abrir y cerrar modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Manejo del formulario
  const handleFileChange = (e) => {
    setFormData({ ...formData, cotizacion: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const form = new FormData();
    form.append("Quo", formData.quo);
    form.append("Cotizacion", formData.cotizacion);

    try {
      const response = await axios.post(
        "https://api.logisticacastrofallas.com/api/Cotizacion/Agregar",
        form
      );
      if (response.data.isSuccess) {
        dispatch(
          showNotification({ message: "Cotización agregada", type: "success" })
        );
        closeModal();
        fetchCotizaciones(filter, textFilter); // Refrescar las cotizaciones
      } else {
        dispatch(
          showNotification({ message: response.data.message, type: "error" })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error al agregar cotización",
          type: "error",
        })
      );
    }
  };

  return (
    <>
      <TitleCard title="Cotizaciones" topMargin="mt-2">
        <div className="mb-4 flex items-center space-x-4">
          <select
            className="select select-primary"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="0">Todos</option>
            <option value="1">Cliente</option>
            <option value="2">Quo</option>
          </select>
          <input
            type="text"
            className="input input-primary"
            value={textFilter}
            onChange={handleTextFilterChange}
            placeholder="Buscar..."
          />
          {isAdmin && (
            <button className="btn btn-primary ml-4" onClick={openModal}>
              Agregar
            </button>
          )}
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>QUO</th>
                <th>Cliente</th>
                <th>Cotizacion</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c, index) => (
                <tr key={index}>
                  <td>{c.quotenumber}</td>
                  <td>{c._customerid_value}</td>
                  <td>{c.new_enlacecotizacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Agregar Nueva Cotización</h3>
            <input
              type="text"
              name="quo"
              className="input input-primary w-full my-2"
              placeholder="QUO"
              value={formData.quo}
              onChange={handleInputChange}
            />
            <input
              type="file"
              className="file-input file-input-primary w-full my-2"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Guardar
              </button>
              <button className="btn" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Cotizaciones;
