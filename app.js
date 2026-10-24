const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navLinks.classList.toggle('is-open', !isOpen);
});

navLinks.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    navLinks.classList.remove('is-open');
  }
});

document.querySelectorAll('[data-project-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-project-filter]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-project-category]').forEach((project) => {
      project.hidden = button.dataset.projectFilter !== 'all'
        && project.dataset.projectCategory !== button.dataset.projectFilter;
    });
  });
});

document.querySelectorAll('[data-certificate-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-certificate-filter]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-certificate-category]').forEach((certificate) => {
      certificate.hidden = button.dataset.certificateFilter !== 'all'
        && certificate.dataset.certificateCategory !== button.dataset.certificateFilter;
    });
  });
});

const certificateDialog = document.querySelector('.certificate-dialog');
const certificatePreview = document.querySelector('#certificate-preview');
const certificateDialogTitle = document.querySelector('#certificate-dialog-title');
const certificateDialogHint = document.querySelector('.certificate-dialog-hint');
const certificateOpenLink = document.querySelector('#certificate-open-link');

function addRootImageFallback(image, filePath = image.getAttribute('src')) {
  if (!filePath) return;

  const sourceUrl = new URL(filePath, document.baseURI);
  const pathParts = sourceUrl.pathname.split('/').filter(Boolean);
  const fileName = decodeURIComponent(pathParts.pop() || '');
  if (pathParts.length === 0 || !fileName) return;

  const rootPath = encodeURIComponent(fileName);
  image.dataset.originalImagePath = filePath;
  image.dataset.imagePathAttempt = 'root';
  image.addEventListener('error', () => {
    if (image.dataset.imagePathAttempt !== 'root') return;

    image.dataset.imagePathAttempt = 'original';
    image.src = image.dataset.originalImagePath;
    if (image.id === 'certificate-preview-image') {
      certificateOpenLink.href = image.dataset.originalImagePath;
    }
  });
  image.src = rootPath;
  if (image.id === 'certificate-preview-image') {
    certificateOpenLink.href = rootPath;
  }
}

document.querySelectorAll('img').forEach((image) => addRootImageFallback(image));

document.querySelectorAll('.certificate-card').forEach((card) => {
  const button = document.createElement('button');
  button.className = 'certificate-view-button';
  button.type = 'button';
  button.innerHTML = 'View certificate <span aria-hidden="true">↗</span>';
  card.querySelector('.certificate-info').append(button);
});

document.querySelector('.certificate-grid').addEventListener('click', (event) => {
  const button = event.target.closest('.certificate-view-button');
  if (!button) return;

  const card = button.closest('.certificate-card');
  const title = card.querySelector('h3').textContent.trim();
  const filePath = card.dataset.certificateFile?.trim();
  certificateDialogTitle.textContent = title;
  certificatePreview.replaceChildren();
  certificateDialogHint.hidden = false;
  certificateOpenLink.hidden = !filePath;
  certificateOpenLink.removeAttribute('href');

  if (filePath) {
    certificateOpenLink.href = filePath;
    const extension = new URL(filePath, document.baseURI).pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
    let preview;

    if (extension === 'pdf') {
      preview = document.createElement('iframe');
      preview.title = `${title} certificate`;
      preview.src = filePath;
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'jfif'].includes(extension)) {
      preview = document.createElement('img');
      preview.id = 'certificate-preview-image';
      preview.alt = `${title} certificate`;
      preview.src = filePath;
      addRootImageFallback(preview, filePath);
    } else {
      certificatePreview.textContent = 'Unsupported file type. Use a PDF, JPG, PNG, WEBP, or GIF certificate.';
      certificateDialogHint.hidden = true;
    }

    if (preview) {
      certificatePreview.append(preview);
      certificateDialogHint.hidden = true;
    }
  } else {
    const emptyState = document.createElement('div');
    emptyState.className = 'certificate-empty-state';
    emptyState.innerHTML = '<span aria-hidden="true">＋</span><strong>Certificate image or PDF not added yet</strong><p>Add the file to your project, then set <code>data-certificate-file="assets/certificates/your-file.pdf"</code> on this certificate card in <code>index.html</code>.</p>';
    certificatePreview.append(emptyState);
  }

  certificateDialog.showModal();
});

document.querySelector('.certificate-dialog-close').addEventListener('click', () => {
  certificateDialog.close();
});

certificateDialog.addEventListener('click', (event) => {
  if (event.target === certificateDialog) certificateDialog.close();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
