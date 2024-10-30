const ShoppingCartTable = ({ confirmedObjects, onQuantityChange }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(confirmedObjects).map(([itemName, item]) => (
          <tr key={itemName}>
            <td>
              <img src={item.image_path} alt={itemName} />
            </td>
            <td>{itemName}</td>
            <td>
              <div className="quantity-controls">
                <button
                  onClick={() => onQuantityChange(itemName, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => onQuantityChange(itemName, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </td>
            <td>${item.unit_price?.toFixed(2)}</td>
            <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
