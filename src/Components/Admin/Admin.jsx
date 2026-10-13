import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { product_list } from "../../data.jsx";
import { apiRequest, formatCurrency } from "../../api.js";
import "./Admin.css";

const tabs = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "products", label: "Products", icon: "▧" },
  { id: "orders", label: "Orders", icon: "▤" },
  { id: "customers", label: "Customers", icon: "♙" },
];

const orderStatuses = ["processing", "shipped", "delivered", "cancelled"];

const emptyProduct = {
  name: "",
  category: "",
  image: "",
  price: "",
  productDetail: {
    description: "",
    delivery: "5-7 Days from order date.",
    shipping: "On Orders above ₹100",
  },
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [admin, setAdmin] = useState(null);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    let active = true;

    const initializeAdmin = async () => {
      try {
        const { user } = await apiRequest("/auth/me");
        if (!active) return;
        setAdmin(user);

        const overviewResponse = await apiRequest("/admin/overview");
        let productsResponse = await apiRequest("/products/admin");

        if (productsResponse.products.length === 0) {
          await apiRequest("/products/admin/seed", {
            method: "POST",
            body: JSON.stringify({ products: product_list }),
          });
          productsResponse = await apiRequest("/products/admin");
        }

        const [ordersResponse, customersResponse] = await Promise.all([
          apiRequest("/orders/admin"),
          apiRequest("/orders/admin/customers"),
        ]);
        if (!active) return;
        setOverview(overviewResponse.overview);
        setProducts(productsResponse.products);
        setOrders(ordersResponse.orders);
        setCustomers(customersResponse.customers);
      } catch (requestError) {
        if (!active) return;
        if (!sessionStorage.getItem("arveToken")) {
          setAccessError("Sign in with your administrator account to continue.");
        } else {
          setError(requestError.message);
          if (requestError.message.includes("Administrator access")) {
            setAccessError(requestError.message);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initializeAdmin();
    return () => {
      active = false;
    };
  }, []);

  const openNewProduct = () => {
    setEditingProductId(null);
    setProductForm(emptyProduct);
    setError("");
    setProductDialogOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      image: product.image,
      price: String(product.price),
      productDetail: {
        description: product.productDetail?.description || "",
        delivery:
          product.productDetail?.delivery || "5-7 Days from order date.",
        shipping: product.        productDetail?.shipping || "On Orders above ₹100",
      },
    });
    setError("");
    setProductDialogOpen(true);
  };

  const updateProductField = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const updateProductDetail = (field, value) => {
    setProductForm((current) => ({
      ...current,
      productDetail: { ...current.productDetail, [field]: value },
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    setNotice("");

    try {
      const isEditing = editingProductId !== null;
      const result = await apiRequest(
        isEditing ? `/products/admin/${editingProductId}` : "/products/admin",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({
            ...productForm,
            price: Number(productForm.price),
          }),
        }
      );
      setProducts((current) =>
        isEditing
          ? current.map((product) =>
              product.id === result.product.id ? result.product : product
            )
          : [...current, result.product].sort((a, b) => a.id - b.id)
      );
      if (!isEditing) {
        setOverview((current) =>
          current
            ? { ...current, productCount: current.productCount + 1 }
            : current
        );
      }
      setProductDialogOpen(false);
      setNotice(isEditing ? "Product updated." : "Product added.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the catalog?`)) return;
    setError("");
    setNotice("");
    try {
      await apiRequest(`/products/admin/${product.id}`, { method: "DELETE" });
      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
      setOverview((current) =>
        current
          ? { ...current, productCount: Math.max(0, current.productCount - 1) }
          : current
      );
      setNotice("Product removed from the catalog.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setError("");
    setNotice("");
    try {
      const { order } = await apiRequest(`/orders/admin/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((current) =>
        current.map((item) => (item._id === order._id ? order : item))
      );
      setOverview((current) =>
        current
          ? {
              ...current,
              recentOrders: current.recentOrders.map((item) =>
                item._id === order._id ? order : item
              ),
            }
          : current
      );
      setNotice("Order status updated.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem("arveToken");
    sessionStorage.removeItem("arveUser");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="admin-loading">
        <span className="admin-loading-mark">A.</span>
        <p>Opening your workspace…</p>
      </main>
    );
  }

  if (accessError) {
    return (
      <main className="admin-access-page">
        <section className="admin-access-card">
          <span className="admin-brand-mark">A.</span>
          <span className="admin-eyebrow">ARVÉ ADMINISTRATION</span>
          <h1>Admin access required</h1>
          <p>{accessError}</p>
          <Link to="/login" className="admin-primary-button">
            Sign in to continue
          </Link>
          <Link to="/" className="admin-back-link">
            Return to the store
          </Link>
        </section>
      </main>
    );
  }

  const renderOrders = (rows) => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order._id}>
              <td className="admin-order-id">#{order._id.slice(-7).toUpperCase()}</td>
              <td>
                <strong>{order.customer.fullName}</strong>
                <small>{order.customer.email}</small>
              </td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td>{formatCurrency(order.total)}</td>
              <td>
                {order.paymentMethod === "razorpay"
                  ? "Razorpay"
                  : order.paymentMethod === "cod"
                    ? "Cash on delivery"
                    : `${order.paymentMethod.toUpperCase()} (legacy demo)`}
                <small>
                  {order.paymentStatus === "paid"
                    ? "Payment captured"
                    : order.paymentStatus}
                </small>
              </td>
              <td>
                <select
                  className={`admin-status-select status-${order.status}`}
                  value={order.status}
                  onChange={(event) =>
                    updateOrderStatus(order._id, event.target.value)
                  }
                  aria-label={`Update order ${order._id.slice(-7)} status`}
                >
                  {orderStatuses.map((status) => (
                    <option value={status} key={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan="7" className="admin-empty-row">
                No orders have been placed yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-brand-mark">A.</span>
          <span>
            <strong>ARVÉ</strong>
            <small>ADMIN STUDIO</small>
          </span>
        </Link>

        <span className="admin-side-label">WORKSPACE</span>
        <nav className="admin-side-nav" aria-label="Admin navigation">
          {tabs.map((tab) => (
            <button
              type="button"
              className={activeTab === tab.id ? "is-active" : ""}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setNotice("");
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
              {tab.id === "orders" && orders.length > 0 && (
                <small>{orders.length}</small>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <span className="admin-avatar">
              {admin?.fullName?.slice(0, 1).toUpperCase() || "A"}
            </span>
            <span>
              <strong>{admin?.fullName}</strong>
              <small>Administrator</small>
            </span>
          </div>
          <button type="button" className="admin-signout" onClick={signOut}>
            Sign out
          </button>
          <Link to="/" className="admin-store-link">← View storefront</Link>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">YOUR STORE AT A GLANCE</span>
            <h1>
              {activeTab === "overview"
                ? "Good to see you."
                : tabs.find((tab) => tab.id === activeTab)?.label}
            </h1>
          </div>
          <span className="admin-topbar-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </header>

        {(error || notice) && (
          <p
            className={`admin-flash ${error ? "is-error" : "is-success"}`}
            role={error ? "alert" : "status"}
          >
            {error || notice}
            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
              }}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </p>
        )}

        {activeTab === "overview" && overview && (
          <>
            <div className="admin-stat-grid">
              <article className="admin-stat-card">
                <span>Catalog products</span>
                <strong>{overview.productCount}</strong>
                <small>Active pieces in your collection</small>
              </article>
              <article className="admin-stat-card">
                <span>Orders received</span>
                <strong>{overview.orderCount}</strong>
                <small>All orders to date</small>
              </article>
              <article className="admin-stat-card">
                <span>Customers</span>
                <strong>{overview.customerCount}</strong>
                <small>Unique customer emails</small>
              </article>
              <article className="admin-stat-card admin-stat-highlight">
                <span>Order value</span>
                <strong>{formatCurrency(overview.salesValue)}</strong>
                <small>Excludes cancelled orders</small>
              </article>
            </div>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">LATEST ACTIVITY</span>
                  <h2>Recent orders</h2>
                </div>
                <button
                  type="button"
                  className="admin-text-button"
                  onClick={() => setActiveTab("orders")}
                >
                  View all orders →
                </button>
              </div>
              {renderOrders(overview.recentOrders)}
            </section>
          </>
        )}

        {activeTab === "products" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">YOUR COLLECTION</span>
                <h2>Product catalog</h2>
              </div>
              <button
                type="button"
                className="admin-primary-button"
                onClick={openNewProduct}
              >
                <span aria-hidden="true">+</span> Add product
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table admin-product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Product ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={product.image} alt="" />
                          <strong>{product.name}</strong>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>#{product.id}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() => openEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() => deleteProduct(product)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" className="admin-empty-row">
                        No products in the catalog.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">CUSTOMER CHECKOUTS</span>
                <h2>Orders <span className="admin-heading-count">{orders.length}</span></h2>
              </div>
              <p className="admin-demo-tag">Cash on delivery and Razorpay payments</p>
            </div>
            {renderOrders(orders)}
            <p className="admin-order-footnote">
              Select an order status to save its progress. Razorpay orders are
              marked paid only after the server verifies the captured payment.
            </p>
          </section>
        )}

        {activeTab === "customers" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">PEOPLE WHO LOVE ARVÉ</span>
                <h2>Customers</h2>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Order value</th>
                    <th>Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td><strong>{customer.fullName}</strong></td>
                      <td>{customer.email}</td>
                      <td>{customer.orderCount}</td>
                      <td>{formatCurrency(customer.totalSpent)}</td>
                      <td>{formatDate(customer.lastOrder)}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="admin-empty-row">
                        Customer details will appear when an order is placed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      {productDialogOpen && (
        <div className="admin-dialog-overlay">
          <section
            className="admin-product-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-dialog-title"
          >
            <button
              type="button"
              className="admin-dialog-close"
              onClick={() => setProductDialogOpen(false)}
              aria-label="Close product form"
            >
              ×
            </button>
            <span className="admin-eyebrow">
              {editingProductId ? "EDIT YOUR COLLECTION" : "GROW YOUR COLLECTION"}
            </span>
            <h2 id="admin-product-dialog-title">
              {editingProductId ? "Edit product" : "Add a product"}
            </h2>
            <form className="admin-product-form" onSubmit={saveProduct}>
              <label>
                Product name
                <input
                  value={productForm.name}
                  onChange={(event) => updateProductField("name", event.target.value)}
                  maxLength={160}
                  required
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Category
                  <input
                    value={productForm.category}
                    onChange={(event) =>
                      updateProductField("category", event.target.value)
                    }
                    maxLength={60}
                    placeholder="e.g. Chair"
                    required
                  />
                </label>
                <label>
                  Price (INR)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={productForm.price}
                    onChange={(event) => updateProductField("price", event.target.value)}
                    required
                  />
                </label>
              </div>
              <label>
                Image URL or site path
                <input
                  value={productForm.image}
                  onChange={(event) => updateProductField("image", event.target.value)}
                  placeholder="https://… or /images/product.jpg"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  rows="3"
                  value={productForm.productDetail.description}
                  onChange={(event) =>
                    updateProductDetail("description", event.target.value)
                  }
                />
              </label>
              {error && <p className="admin-form-error" role="alert">{error}</p>}
              <button
                type="submit"
                className="admin-primary-button admin-save-product"
                disabled={savingProduct}
              >
                {savingProduct
                  ? "Saving…"
                  : editingProductId
                    ? "Save changes"
                    : "Add product"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Admin;
