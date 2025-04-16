// Image Trail Effect
// Adapted from codegrid-burocratik-image-trail-nextjs for vanilla JS

class ImageTrail {
    constructor(options = {}) {
      this.config = {
        imageCount: 35,
        imageLifespan: 750,
        removalDelay: 50,
        mouseThreshold: 100,
        scrollThreshold: 50,
        idleCursorInterval: 300,
        inDuration: 750,
        outDuration: 1000,
        inEasing: "cubic-bezier(.07,.5,.5,1)",
        outEasing: "cubic-bezier(.87, 0, .13, 1)",
        ...options
      };
  
      this.trail = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.isMoving = false;
      this.isCursorInContainer = false;
      this.isScrolling = false;
      this.scrollTicking = false;
  
      this.lastRemovalTime = 0;
      this.lastSteadyImageTime = 0;
      this.lastScrollTime = 0;
      this.moveTimeout = null;
      this.scrollTimeout = null;
  
      this.container = null;
      this.animationFrame = null;
      
      // Store the containerId for initialization
      this.containerId = options.containerId || null;
      
      // Use provided images or create default array
      this.images = options.images || Array.from(
        { length: this.config.imageCount },
        (_, i) => `/img${i + 1}.jpeg`
      );
      
      // Bind methods to prevent context loss
      this._handleMouseMove = this._handleMouseMove.bind(this);
      this._handleScroll1 = this._handleScroll1.bind(this);
      this._handleScroll2 = this._handleScroll2.bind(this);
      this._animate = this._animate.bind(this);
    }
  
    initialize(containerSelector) {
      // Use provided selector or fallback to the containerId from constructor
      const selector = containerSelector || `#${this.containerId}`;
      
      // Find the container element
      this.container = document.querySelector(selector);
      
      if (!this.container) {
        console.error(`Container with selector '${selector}' not found`);
        return;
      }
      
      console.log(`Found container: ${selector}`, this.container);
      
      // Set container class for styling
      this.container.classList.add("trailContainer");
      
      // Add required event listeners
      this._addEventListeners();
      
      // Set initial mouse position
      this._setInitialMousePos();
      
      // Start animation loop
      this.animationFrame = requestAnimationFrame(this._animate);
      
      // Pre-load images
      this._preloadImages();
      
      return this;
    }
  
    _preloadImages() {
      // Preload all images to prevent loading delays during animation
      this.images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  
    _setInitialMousePos() {
      const handleInitialMove = (event) => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.isCursorInContainer = this._isInContainer(this.mouseX, this.mouseY);
        document.removeEventListener("mousemove", handleInitialMove);
      };
  
      document.addEventListener("mousemove", handleInitialMove, { once: true });
    }
  
    _addEventListeners() {
      document.addEventListener("mousemove", this._handleMouseMove);
      window.addEventListener("scroll", this._handleScroll1, { passive: true });
      window.addEventListener("scroll", this._handleScroll2, { passive: true });
    }
  
    _removeEventListeners() {
      document.removeEventListener("mousemove", this._handleMouseMove);
      window.removeEventListener("scroll", this._handleScroll1);
      window.removeEventListener("scroll", this._handleScroll2);
      clearTimeout(this.moveTimeout);
      clearTimeout(this.scrollTimeout);
      cancelAnimationFrame(this.animationFrame);
    }
  
    _isInContainer(x, y) {
      if (!this.container) return false;
  
      const rect = this.container.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }
  
    _hasMovedEnough() {
      const distance = Math.sqrt(
        Math.pow(this.mouseX - this.lastMouseX, 2) +
        Math.pow(this.mouseY - this.lastMouseY, 2)
      );
      return distance > this.config.mouseThreshold;
    }
  
    _createImage() {
      if (!this.container || !this.isCursorInContainer) return;
  
      const img = document.createElement("img");
      img.classList.add("trail-img");
  
      // Select a random image from the array
      const randomIndex = Math.floor(Math.random() * this.images.length);
      const imageSrc = this.images[randomIndex];
      const rotation = (Math.random() - 0.5) * 50;
      
      // Set image source and add error handling
      img.src = imageSrc;
      img.onerror = () => {
        console.error(`Failed to load image: ${imageSrc}`);
        // Set a fallback image or remove the element on error
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
        // Remove from trail array
        const index = this.trail.findIndex(item => item.element === img);
        if (index !== -1) {
          this.trail.splice(index, 1);
        }
      };
  
      // Position the image at the mouse coordinates
      const rect = this.container.getBoundingClientRect();
      const relativeX = this.mouseX - rect.left;
      const relativeY = this.mouseY - rect.top;
  
      img.style.left = `${relativeX}px`;
      img.style.top = `${relativeY}px`;
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
      img.style.transition = `transform ${this.config.inDuration}ms ${this.config.inEasing}`;
  
      // Add image to the container
      this.container.appendChild(img);
  
      // Start the entry animation after a short delay
      setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
      }, 10);
  
      // Add to trail array
      this.trail.push({
        element: img,
        rotation: rotation,
        removeTime: Date.now() + this.config.imageLifespan
      });
    }
  
    _createScrollTrailImage() {
      if (!this.isCursorInContainer) return;
  
      this.lastMouseX += (this.config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
      this.lastMouseY += (this.config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
  
      this._createImage();
  
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
    }
  
    _createTrailImage() {
      if (!this.isCursorInContainer) return;
  
      const now = Date.now();
  
      if (this.isMoving && this._hasMovedEnough()) {
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this._createImage();
        return;
      }
  
      if (!this.isMoving && now - this.lastSteadyImageTime >= this.config.idleCursorInterval) {
        this.lastSteadyImageTime = now;
        this._createImage();
      }
    }
  
    _removeOldImages() {
      const now = Date.now();
  
      if (now - this.lastRemovalTime < this.config.removalDelay || this.trail.length === 0)
        return;
  
      const oldestImage = this.trail[0];
      if (now >= oldestImage.removeTime) {
        const imgToRemove = this.trail.shift();
  
        imgToRemove.element.style.transition = `transform ${this.config.outDuration}ms ${this.config.outEasing}`;
        imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;
  
        this.lastRemovalTime = now;
  
        setTimeout(() => {
          if (imgToRemove.element.parentNode) {
            imgToRemove.element.parentNode.removeChild(imgToRemove.element);
          }
        }, this.config.outDuration);
      }
    }
  
    _animate() {
      this._createTrailImage();
      this._removeOldImages();
      this.animationFrame = requestAnimationFrame(this._animate.bind(this));
    }
  
    _handleMouseMove(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.isCursorInContainer = this._isInContainer(this.mouseX, this.mouseY);
  
      if (this.isCursorInContainer) {
        this.isMoving = true;
        clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
          this.isMoving = false;
        }, 100);
      }
    }
  
    _handleScroll1() {
      this.isCursorInContainer = this._isInContainer(this.mouseX, this.mouseY);
  
      if (this.isCursorInContainer) {
        this.isMoving = true;
        this.lastMouseX += (Math.random() - 0.5) * 10;
  
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.isMoving = false;
        }, 100);
      }
    }
  
    _handleScroll2() {
      const now = Date.now();
      this.isScrolling = true;
  
      if (now - this.lastScrollTime < this.config.scrollThreshold) return;
  
      this.lastScrollTime = now;
  
      if (!this.scrollTicking) {
        requestAnimationFrame(() => {
          if (this.isScrolling) {
            this._createScrollTrailImage();
            this.isScrolling = false;
          }
          this.scrollTicking = false;
        });
        this.scrollTicking = true;
      }
    }
  
    destroy() {
      this._removeEventListeners();
  
      // Remove all trail images
      this.trail.forEach(item => {
        if (item.element && item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
      });
      
      // Clear all remaining images in the container
      if (this.container) {
        const remainingImages = this.container.querySelectorAll('.trail-img');
        remainingImages.forEach(img => {
          img.parentNode.removeChild(img);
        });
      }
      
      this.trail = [];
      console.log("Image trail destroyed");
    }
  }
  
  export default ImageTrail; 