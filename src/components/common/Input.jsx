function Input({
  label,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-3 outline-none focus:border-blue-600"
      />
    </div>
  );
}

export default Input;