function TableShell({
  children
}) {

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        {children}
      </div>
    </div>
  );

}

export default TableShell;
