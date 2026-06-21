export const requiredText = (
  value
) => Boolean(
  String(value || "").trim()
);

export const todayDateString = () => {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

};

export const isValidPhoneNumber = (
  value
) => {

  const digits =
    String(value || "")
      .trim();

  return (
    /^\d{10}$/.test(digits)
  );

};

export const isPositiveQuantity = (
  value
) => {

  const quantity =
    Number(value);

  return (
    requiredText(value) &&
    Number.isFinite(quantity) &&
    quantity > 0
  );

};

export const getItemValidationErrors = (
  items
) => {

  const errors = [];

  items.forEach(
    (item, index) => {

      const rowNumber =
        index + 1;

      const hasAnyValue =
        requiredText(
          item.itemDescription
        ) ||
        requiredText(
          item.quantity
        ) ||
        requiredText(
          item.remarks
        );

      if (!hasAnyValue) {

        errors.push(
          `Item ${rowNumber}: remove the empty row or fill item description and quantity.`
        );

        return;

      }

      if (
        !requiredText(
          item.itemDescription
        )
      ) {

        errors.push(
          `Item ${rowNumber}: item description is required.`
        );

      }

      if (
        !isPositiveQuantity(
          item.quantity
        )
      ) {

        errors.push(
          `Item ${rowNumber}: quantity must be greater than 0.`
        );

      }

    }
  );

  return errors;

};

export const formatValidationMessage = (
  errors
) => `Please fix the following:\n${errors
  .map(
    (error) => `- ${error}`
  )
  .join("\n")}`;
