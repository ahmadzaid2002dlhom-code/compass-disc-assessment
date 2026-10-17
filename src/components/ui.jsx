export function Btn({ children, onClick, type = 'button', variant = 'primary', disabled = false }) {
  return (
    <button type={type} className={'btn ' + variant} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function ErrorMessage({ error }) {
  return error ? (
    <p className="error" role="alert">
      {error}
    </p>
  ) : null;
}
