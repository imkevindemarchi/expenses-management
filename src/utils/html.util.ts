export function setPageTitle(partialTitle: string): void {
  document.title = `${process.env.REACT_APP_WEBSITE_NAME} - ${partialTitle}`;
}

export function imageExists(imageUrl: string) {
  const http = new XMLHttpRequest();

  http.open("HEAD", imageUrl, false);
  http.send();

  return http.status !== 404 && http.status !== 400;
}
