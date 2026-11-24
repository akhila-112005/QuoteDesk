
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  ShieldCheck,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:8000/api";

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function statusClass(status) {
  return `status status-${String(status).toLowerCase().replaceAll(" ", "-")}`;
}

function getToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function App() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeRfq, setActiveRfq] = useState(null);
  const [showRfqForm, setShowRfqForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadRfqs() {
    try {
      setError("");

      const response = await fetch(`${API}/rfqs/`);

      if (!response.ok) {
        throw new Error("Could not load RFQs from the server.");
      }

      const data = await response.json();
      setRfqs(data);

      if (activeRfq) {
        const refreshed = data.find((item) => item.id === activeRfq.id);
        setActiveRfq(refreshed || null);
      }
    } catch (err) {
      setError(`${err.message} Make sure the Django server is running.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRfqs();
  }, []);

  const filteredRfqs = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return rfqs;

    return rfqs.filter((rfq) =>
      `${rfq.part_number} ${rfq.description}`.toLowerCase().includes(term)
    );
  }, [rfqs, search]);

  const stats = {
    total: rfqs.length,
    open: rfqs.filter((item) => item.status === "Open").length,
    quoted: rfqs.filter((item) => item.status === "Quoted").length,
    expired: rfqs.filter((item) => item.status === "Expired").length,
  };

  async function createRfq(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      part_number: form.get("part_number").trim(),
      description: form.get("description").trim(),
      quantity: Number(form.get("quantity")),
      needed_by: form.get("needed_by"),
    };

    setSaving(true);

    try {
      const response = await fetch(`${API}/rfqs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setShowRfqForm(false);
      setActiveRfq(data);
      await loadRfqs();
    } catch (err) {
      alert(`Could not create RFQ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRfq(id) {
    if (!window.confirm("Are you sure you want to delete this RFQ?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/rfqs/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete this RFQ.");
      }

      if (activeRfq?.id === id) {
        setActiveRfq(null);
      }

      await loadRfqs();
    } catch (err) {
      alert(err.message);
    }
  }

  async function createQuote(event) {
    event.preventDefault();

    if (!activeRfq) return;

    setSaving(true);

    const form = new FormData(event.currentTarget);

    const payload = {
      supplier_name: form.get("supplier_name").trim(),
      unit_price: form.get("unit_price"),
      lead_time_days: Number(form.get("lead_time_days")),
      valid_until: form.get("valid_until"),
    };

    const isEditing = Boolean(editingQuote);

    const url = isEditing
      ? `${API}/rfqs/${activeRfq.id}/quotes/${editingQuote.id}/`
      : `${API}/rfqs/${activeRfq.id}/quotes/`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save the quotation.");
      }

      setShowQuoteForm(false);
      setEditingQuote(null);
      await loadRfqs();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuote(id) {
    if (!window.confirm("Are you sure you want to delete this quotation?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/rfqs/${activeRfq.id}/quotes/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete this quotation.");
      }

      await loadRfqs();
    } catch (err) {
      alert(err.message);
    }
  }

  const today = getToday();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Package size={21} />
          </div>

          <div>
            <strong>
              quote<span>desk</span>
            </strong>
            <small>PROCUREMENT WORKSPACE</small>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        <button
          className={`nav-link ${!activeRfq ? "selected" : ""}`}
          onClick={() => setActiveRfq(null)}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          className={`nav-link ${activeRfq ? "selected" : ""}`}
          onClick={() => {
            if (activeRfq) {
              setActiveRfq(activeRfq);
            } else if (rfqs.length > 0) {
              setActiveRfq(rfqs[0]);
            } else {
              alert("Please create an RFQ first.");
            }
          }}
        >
          <FileText size={18} />
          RFQ Details
        </button>

        <div className="sidebar-bottom">
          <div className="secure-icon">
            <ShieldCheck size={17} />
          </div>

          <div>
            <b>Workspace ready</b>
            <small>Your data is saved locally</small>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">PROCUREMENT / OVERVIEW</span>
            <h1>{activeRfq ? activeRfq.part_number : "Dashboard"}</h1>
          </div>

          <div className="top-actions">
            <span className="live-dot">System online</span>

            <button
              className="primary-btn"
              onClick={() => setShowRfqForm(true)}
            >
              <Plus size={17} />
              Create RFQ
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            {error}
            <button onClick={loadRfqs}>Retry</button>
          </div>
        )}

        {activeRfq ? (
          <section className="content">
            <button className="back-link" onClick={() => setActiveRfq(null)}>
              ← Back to dashboard
            </button>

            <div className="detail-heading">
              <div>
                <span className="eyebrow">REQUEST FOR QUOTATION</span>
                <h2>{activeRfq.part_number}</h2>
                <p>{activeRfq.description}</p>
              </div>

              <span className={statusClass(activeRfq.status)}>
                {activeRfq.status}
              </span>
            </div>

            <div className="detail-grid">
              <div className="info-card">
                <small>QUANTITY</small>
                <b>{activeRfq.quantity.toLocaleString("en-IN")} units</b>
              </div>

              <div className="info-card">
                <small>NEEDED BY</small>
                <b>{formatDate(activeRfq.needed_by)}</b>
              </div>

              <div className="info-card">
                <small>SUPPLIER QUOTES</small>
                <b>{activeRfq.quotes?.length || 0}</b>
              </div>
            </div>

            <div className="section-heading">
              <div>
                <h3>Supplier quotes</h3>
                <p>Compare price, lead time and validity.</p>
              </div>

              <button
                className="primary-btn"
                onClick={() => {
                  setEditingQuote(null);
                  setShowQuoteForm(true);
                }}
              >
                <Plus size={16} />
                Add quote
              </button>
            </div>

            {activeRfq.best_quote && (
              <div className="best-card">
                <div className="best-icon">
                  <CheckCircle2 size={22} />
                </div>

                <div className="best-copy">
                  <small>BEST ELIGIBLE QUOTE</small>
                  <b>{activeRfq.best_quote.supplier_name}</b>
                  <span>
                    Lowest price among valid quotes that can arrive by the
                    required date.
                  </span>
                </div>

                <strong>
                  {money(activeRfq.best_quote.unit_price)}
                  <small> / unit</small>
                </strong>
              </div>
            )}

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>SUPPLIER</th>
                    <th>UNIT PRICE</th>
                    <th>LEAD TIME</th>
                    <th>VALID UNTIL</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {(activeRfq.quotes || []).map((quote) => {
                    const isBest = activeRfq.best_quote?.id === quote.id;

                    const arrivalDate = new Date(`${today}T00:00:00`);
                    arrivalDate.setDate(
                      arrivalDate.getDate() + quote.lead_time_days
                    );

                    const neededBy = new Date(
                      `${activeRfq.needed_by}T00:00:00`
                    );

                    const arrivesOnTime = arrivalDate <= neededBy;
                    const valid = quote.valid_until >= today;

                    return (
                      <tr key={quote.id}>
                        <td>
                          <b>{quote.supplier_name}</b>
                          {isBest && <span className="best-tag">BEST</span>}
                        </td>

                        <td className="price-cell">
                          {money(quote.unit_price)}
                        </td>

                        <td>{quote.lead_time_days} days</td>
                        <td>{formatDate(quote.valid_until)}</td>

                        <td>
                          <span
                            className={statusClass(
                              !valid
                                ? "Expired"
                                : arrivesOnTime
                                  ? "Eligible"
                                  : "Late delivery"
                            )}
                          >
                            {!valid
                              ? "Expired"
                              : arrivesOnTime
                                ? "Eligible"
                                : "Late delivery"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="icon-btn"
                            title="Edit quote"
                            onClick={() => {
                              setEditingQuote(quote);
                              setShowQuoteForm(true);
                            }}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="icon-btn danger"
                            title="Delete quote"
                            onClick={() => deleteQuote(quote.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {(!activeRfq.quotes || activeRfq.quotes.length === 0) && (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        No supplier quotes yet. Add the first quote to compare
                        offers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="content">
            <div className="welcome-row">
              <div>
                <h2>Good work starts with clarity.</h2>
                <p>
                  Track requests, compare supplier offers, and find the best
                  eligible quote.
                </p>
              </div>

              <div className="date-chip">
                <CalendarDays size={16} />
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="stats-grid">
              <StatCard
                title="Total RFQs"
                value={stats.total}
                icon={<FileText />}
                note="All requests"
              />

              <StatCard
                title="Open"
                value={stats.open}
                icon={<Clock3 />}
                note="Awaiting quotes"
              />

              <StatCard
                title="Quoted"
                value={stats.quoted}
                icon={<CheckCircle2 />}
                note="Active supplier offers"
              />

              <StatCard
                title="Expired"
                value={stats.expired}
                icon={<AlertCircle />}
                note="Past deadline or validity"
              />
            </div>

            <div className="section-heading list-heading">
              <div>
                <h3>Recent requests</h3>
                <p>Your latest procurement activity</p>
              </div>

              <label className="search-box">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search part number..."
                />
              </label>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>PART NUMBER</th>
                    <th>DESCRIPTION</th>
                    <th>QUANTITY</th>
                    <th>NEEDED BY</th>
                    <th>STATUS</th>
                    <th>BEST PRICE</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        Loading requests...
                      </td>
                    </tr>
                  ) : (
                    filteredRfqs.map((rfq) => (
                      <tr key={rfq.id}>
                        <td>
                          <button
                            className="part-link"
                            onClick={() => setActiveRfq(rfq)}
                          >
                            {rfq.part_number}
                            <ChevronRight size={14} />
                          </button>
                        </td>

                        <td className="description-cell">{rfq.description}</td>
                        <td>{rfq.quantity}</td>
                        <td>{formatDate(rfq.needed_by)}</td>

                        <td>
                          <span className={statusClass(rfq.status)}>
                            {rfq.status}
                          </span>
                        </td>

                        <td className="price-cell">
                          {rfq.best_quote
                            ? money(rfq.best_quote.unit_price)
                            : "—"}
                        </td>

                        <td>
                          <button
                            className="icon-btn danger"
                            title="Delete RFQ"
                            onClick={() => deleteRfq(rfq.id)}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}

                  {!loading && filteredRfqs.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        {search
                          ? "No matching requests found."
                          : "No RFQs yet. Create your first request to get started."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="tip-row">
              <Activity size={17} />
              <span>
                <b>Smart quote selection:</b> Best quote considers both price
                and delivery deadline—not just the cheapest offer.
              </span>
            </div>
          </section>
        )}
      </main>

      {showRfqForm && (
        <Modal
          title="Create a new RFQ"
          subtitle="Add the part and delivery details."
          onClose={() => setShowRfqForm(false)}
        >
          <form onSubmit={createRfq} className="form-grid">
            <Field label="Part number">
              <input
                name="part_number"
                required
                maxLength="100"
                placeholder="e.g. PART-1001"
              />
            </Field>

            <Field label="Quantity">
              <input
                name="quantity"
                type="number"
                min="1"
                required
                placeholder="e.g. 250"
              />
            </Field>

            <Field label="Description" wide>
              <textarea
                name="description"
                required
                rows="3"
                placeholder="Describe the part or component..."
              />
            </Field>

            <Field label="Needed by">
              <input name="needed_by" type="date" min={today} required />
            </Field>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowRfqForm(false)}
              >
                Cancel
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Create RFQ"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showQuoteForm && (
        <Modal
          title={editingQuote ? "Edit supplier quote" : "Add supplier quote"}
          subtitle={
            editingQuote
              ? `Update the offer from ${editingQuote.supplier_name}.`
              : `Submit an offer for ${activeRfq?.part_number || ""}.`
          }
          onClose={() => {
            setShowQuoteForm(false);
            setEditingQuote(null);
          }}
        >
          <form onSubmit={createQuote} className="form-grid">
            <Field label="Supplier name" wide>
              <input
                name="supplier_name"
                required
                placeholder="e.g. Acme Components"
                defaultValue={editingQuote?.supplier_name || ""}
              />
            </Field>

            <Field label="Unit price (INR)">
              <input
                name="unit_price"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 425.50"
                defaultValue={editingQuote?.unit_price || ""}
              />
            </Field>

            <Field label="Lead time (days)">
              <input
                name="lead_time_days"
                type="number"
                min="0"
                required
                placeholder="e.g. 5"
                defaultValue={editingQuote?.lead_time_days ?? ""}
              />
            </Field>

            <Field label="Valid until">
              <input
                name="valid_until"
                type="date"
                required
                defaultValue={editingQuote?.valid_until || ""}
              />
            </Field>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowQuoteForm(false);
                  setEditingQuote(null);
                }}
              >
                Cancel
              </button>

              <button className="primary-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingQuote
                    ? "Update quote"
                    : "Save quote"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, note }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div>{icon}</div>
      </div>

      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function Field({ label, wide, children }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
