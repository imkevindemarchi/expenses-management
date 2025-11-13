export function getFromStorage(propLabel: string): any {
  const name: string = `${process.env.REACT_APP_WEBSITE_NAME} - ${propLabel}`;

  const elabData: any = JSON.parse(localStorage.getItem(name) as any);

  return elabData;
}

export function setToStorage(propLabel: string, data: any): void {
  const name: string = `${process.env.REACT_APP_WEBSITE_NAME} - ${propLabel}`;

  const elabData: any = JSON.stringify(data);

  localStorage.setItem(name, elabData);
}

export function removeFromStorage(propLabel: string): void {
  const name: string = `${process.env.REACT_APP_WEBSITE_NAME} - ${propLabel}`;

  localStorage.removeItem(name);
}
