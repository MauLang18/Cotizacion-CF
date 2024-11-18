import React, { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import { useDispatch } from "react-redux";

// Importación de datos
import polMapping from "../../data/pol.json";
import poeMapping from "../../data/poe.json";
import statusMapping from "../../data/status.json";
import cantEquipoMapping from "../../data/cantEquipo.json";
import tamanoEquipoMapping from "../../data/tamanoEquipo.json";
import ejecutivoMapping from "../../data/ejecutivo.json";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("0");
  const [textFilter, setTextFilter] = useState("");
  const [comments, setComments] = useState({});
  const [isAdmin, setIsAdmin] = useState(true); // Cambiar según lógica de autenticación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pdfFile: null,
    field1: "",
    field2: "",
  });
  const dispatch = useDispatch();

  // Obtener leads
  const fetchLeads = async (filterValue, textValue) => {
    try {
      const response = await fetch(
        `https://api.logisticacastrofallas.com/api/TransInternacional?numFilter=${filterValue}&textFilter=${textValue}`
      );
      const data = await response.json();
      if (data.isSuccess) {
        setLeads(data.data.value);
      } else {
        dispatch(showNotification({ message: data.message, type: "error" }));
      }
    } catch (error) {
      dispatch(
        showNotification({ message: "Error fetching leads", type: "error" })
      );
    }
  };

  useEffect(() => {
    fetchLeads(filter, textFilter);
  }, [filter, textFilter]);

  // Manejo de filtros
  const handleFilterChange = (e) => setFilter(e.target.value);
  const handleTextFilterChange = (e) => setTextFilter(e.target.value);

  // Manejo de comentarios
  const handleCommentChange = (e, id) => {
    setComments({ ...comments, [id]: e.target.value });
  };

  const handleCommentBlur = async (id) => {
    const comentario = comments[id] || "";
    try {
      const response = await axios.patch(
        "https://api.logisticacastrofallas.com/api/TransInternacional/Agregar",
        {
          transInternacionalId: id,
          comentario,
        }
      );
      if (response.data.isSuccess) {
        dispatch(
          showNotification({ message: "Comentario guardado", type: "success" })
        );
      } else {
        dispatch(
          showNotification({ message: response.data.message, type: "error" })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error al guardar el comentario",
          type: "error",
        })
      );
    }
  };

  // Abrir y cerrar modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    setFormData({ ...formData, pdfFile: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const form = new FormData();
    form.append("pdfFile", formData.pdfFile);
    form.append("field1", formData.field1);
    form.append("field2", formData.field2);

    try {
      const response = await axios.post(
        "https://api.logisticacastrofallas.com/api/TransInternacional/Agregar",
        form
      );
      if (response.data.isSuccess) {
        dispatch(
          showNotification({ message: "Datos agregados", type: "success" })
        );
        closeModal();
        fetchLeads(filter, textFilter); // Refrescar los leads
      } else {
        dispatch(
          showNotification({ message: response.data.message, type: "error" })
        );
      }
    } catch (error) {
      dispatch(
        showNotification({
          message: "Error al agregar datos",
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
            <option value="2">Cotizacion</option>
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
                <th>Cotización</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, k) => (
                <tr key={k}>
                  <td>{l.title}</td>
                  <td>{statusMapping[l.new_preestado2] || "N/A"}</td>
                  <td>{l._customerid_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Agregar Nuevo Registro</h3>
            <input
              type="text"
              name="field1"
              className="input input-primary w-full my-2"
              placeholder="Campo 1"
              value={formData.field1}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="field2"
              className="input input-primary w-full my-2"
              placeholder="Campo 2"
              value={formData.field2}
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

export default Leads;
