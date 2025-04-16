import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import SplitType from "split-type";
import { projectsData } from "./projects.js";
import ImageTrail from "./imageTrail.js";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

document.addEventListener("DOMContentLoaded", () => {
  // Add loading class to body to prevent scrolling during loader
  document.body.classList.add('loading');
  document.documentElement.classList.add('no-scroll');
  
  // Test form functionality directly
  setTimeout(() => {
    testFormFunctionality();
  }, 2000);
  
  // Force the page to start at the top
  window.scrollTo(0, 0);
  
  const projectsContainer = document.querySelector(".projects");
  const locationsContainer = document.querySelector(".locations");
  const gridImages = gsap.utils.toArray(".img");
  const heroImage = document.querySelector(".img.hero-img");
  const images = gridImages.filter((img) => img !== heroImage);
  const logoSvg = document.querySelector(".loader .logo-svg");
  
  // Hide trail section initially
  gsap.set(".trail-section", { autoAlpha: 0 });

  const introCopy = new SplitType(".intro-copy h3", {
    types: "words",
    absolute: false,
  });

  const titleHeading = new SplitType(".title h1", {
    types: "words",
    absolute: false,
  });

  const allImageSources = Array.from(
    { length: 35 },
    (_, i) => `/img${i + 1}.jpeg`
  );

  const getRandomImageSet = () => {
    const shuffled = [...allImageSources].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 9);
  };

  function initializeDynamicContent() {
    projectsData.forEach((project) => {
      const projectItem = document.createElement("div");
      projectItem.className = "project-item";

      const projectName = document.createElement("p");
      projectName.textContent = project.name;

      const directorName = document.createElement("p");
      directorName.textContent = project.director;

      projectItem.appendChild(projectName);
      projectItem.appendChild(directorName);

      projectsContainer.appendChild(projectItem);
    });

    projectsData.forEach((project) => {
      const locationItem = document.createElement("div");
      locationItem.className = "location-item";

      const locationName = document.createElement("p");
      locationName.textContent = project.location;

      locationItem.appendChild(locationName);
      locationsContainer.appendChild(locationItem);
    });
  }

  function startImageRotation() {
    const totalCycles = 20;

    for (let cycle = 0; cycle < totalCycles; cycle++) {
      const randomImages = getRandomImageSet();

      gsap.to(
        {},
        {
          duration: 0,
          delay: cycle * 0.15,
          onComplete: () => {
            gridImages.forEach((img, index) => {
              const imgElement = img.querySelector("img");

              if (cycle === totalCycles - 1 && img === heroImage) {
                imgElement.src = "/img5.jpeg";
                gsap.set(".hero-img img", { 
                  scale: 2,
                  borderRadius: "12px"
                });
                gsap.set(".hero-img", {
                  boxShadow: "0 30px 50px rgba(0, 0, 0, 0.4)",
                  borderRadius: "12px"
                });
              } else {
                imgElement.src = randomImages[index];
              }
            });
          },
        }
      );
    }
  }

  function setupInitialStates() {
    gsap.set("nav", {
      y: "-125%",
    });

    gsap.set(introCopy.words, {
      y: "110%",
    });

    gsap.set(titleHeading.words, {
      y: "110%",
    });
    
    gsap.set(".scroll-indicator", {
      opacity: 0,
      y: 10
    });
    
    // Make sure image grid is visible but images are clipped initially
    gsap.set(".image-grid", {
      autoAlpha: 1
    });
    
    // Logo initial state
    gsap.set(".loader .logo-svg", {
      opacity: 0,
      scale: 0.5,
      rotation: -180
    });
    
    // Hero brand initial state
    gsap.set(".hero-brand", {
      y: -50,
      opacity: 0
    });
  }

  function init() {
    initializeDynamicContent();
    setupInitialStates();
    createAnimationTimelines();
    initializeImageTrail();
    initializeScrollIndicator();
    initializeFormHandling();
  }

  init();

  function createAnimationTimelines() {
    const overlayTimeline = gsap.timeline();
    const imagesTimeline = gsap.timeline();
    const textTimeline = gsap.timeline();

    // Ensure images are visible but clipped initially
    imagesTimeline.set(".img", {
      autoAlpha: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
    });
    
    // Logo animation
    overlayTimeline.to(".loader .logo-svg", {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1,
      ease: "back.out(1.7)",
    });

    overlayTimeline.to(".logo-line-1", {
      backgroundPosition: "0% 0%",
      color: "#fff",
      duration: 1,
      ease: "none",
      delay: 0.2,
      onComplete: () => {
        gsap.to(".logo-line-2", {
          backgroundPosition: "0% 0%",
          color: "#fff",
          duration: 1,
          ease: "none",
        });
      },
    });

    overlayTimeline.to([".projects-header", ".project-item"], {
      opacity: 1,
      duration: 0.15,
      stagger: 0.075,
      delay: 1,
    });

    overlayTimeline.to(
      [".locations-header", ".location-item"],
      {
        opacity: 1,
        duration: 0.15,
        stagger: 0.075,
      },
      "<"
    );

    overlayTimeline.to(".project-item", {
      color: "#fff",
      duration: 0.15,
      stagger: 0.075,
    });

    overlayTimeline.to(
      ".location-item",
      {
        color: "#fff",
        duration: 0.15,
        stagger: 0.075,
      },
      "<"
    );

    overlayTimeline.to([".projects-header", ".project-item"], {
      opacity: 0,
      duration: 0.15,
      stagger: 0.075,
    });

    overlayTimeline.to(
      [".locations-header", ".location-item"],
      {
        opacity: 0,
        duration: 0.15,
        stagger: 0.075,
      },
      "<"
    );

    overlayTimeline.to(".overlay", {
      opacity: 0,
      duration: 0.5,
      delay: 1.5,
    });

    imagesTimeline.to(".img", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      delay: 2.5,
      stagger: 0.05,
      ease: "hop",
      onStart: () => {
        setTimeout(() => {
          startImageRotation();
          gsap.to(".loader", { opacity: 0, duration: 0.3 });
        }, 1000);
      },
    });

    imagesTimeline.to(images, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      delay: 2.5,
      stagger: 0.05,
      ease: "hop",
    });

    imagesTimeline.to(".hero-img", {
      y: -50,
      duration: 1,
      ease: "hop",
    });

    imagesTimeline.to(".hero-img", {
      scale: 4,
      clipPath: "polygon(20% 10%, 80% 10%, 80% 90%, 20% 90%)",
      duration: 1.5,
      ease: "hop",
      borderRadius: "12px",
      onStart: () => {
        gsap.to(".hero-img img", {
          scale: 1,
          duration: 1.5,
          ease: "hop",
          borderRadius: "12px",
        });

        gsap.to(".banner-img", { 
          scale: 1, 
          delay: 0.5, 
          duration: 0.5,
          boxShadow: "0 25px 40px rgba(0, 0, 0, 0.3)",
        });
        gsap.to("nav", { y: "0%", duration: 1, ease: "hop", delay: 0.25 });
      },
      onComplete: () => {
        // Set trail section to be invisible but able to be revealed
        gsap.set(".trail-section", { autoAlpha: 0, visibility: "visible" });
        
        // Enable scrolling only after all animations are complete
        setTimeout(() => {
          document.body.classList.remove('loading');
          document.documentElement.classList.remove('no-scroll');
          
          // Add subtle indicator that scrolling is now possible
          gsap.to(".scroll-indicator", {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        }, 1000);
      }
    });

    imagesTimeline.to(
      ".banner-img-1",
      {
        left: "40%",
        rotate: -20,
        duration: 1.5,
        delay: 0.5,
        ease: "hop",
      },
      "<"
    );

    imagesTimeline.to(
      ".banner-img-2",
      {
        left: "60%",
        rotate: 20,
        duration: 1.5,
        ease: "hop",
      },
      "<"
    );

    textTimeline.to(titleHeading.words, {
      y: "0%",
      duration: 1,
      stagger: 0.1,
      delay: 9.5,
      ease: "power3.out",
    });

    textTimeline.to(
      introCopy.words,
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        delay: 0.25,
        ease: "power3.out",
      },
      "<"
    );
    
    // Animate hero brand
    textTimeline.to(".hero-brand", {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    }, "<0.2");
  }

  function initializeImageTrail() {
    console.log("Initializing image trail...");
    const trailSection = document.querySelector(".trail-section");
    const trailContainer = document.querySelector("#trail-container");
    let imageTrail = null;
    let observer = null;
    
    // Check screen width - only initialize on larger screens
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      console.log("Mobile detected - image trail disabled");
      // Still show the section but without the trail effect
      if (trailSection) {
        // Make the trail section fully visible on mobile
        trailSection.style.visibility = 'visible';
        trailSection.style.opacity = '1';
        
        // Ensure the trailContainer is not displayed on mobile
        if (trailContainer) {
          trailContainer.style.display = 'none';
        }
        
        gsap.to('.trail-section', { 
          autoAlpha: 1, 
          duration: 0.5,
          ease: 'power1.inOut'
        });
        
        gsap.fromTo('.trail-section-content', 
          { opacity: 0, y: 50 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            ease: 'power3.out',
            onComplete: () => {
              // Ensure form is interactive after animation
              const form = document.getElementById('waitlist-form');
              if (form) {
                form.style.pointerEvents = 'auto';
                const emailInput = document.getElementById('email-input');
                const submitButton = document.getElementById('submit-button');
                if (emailInput) emailInput.style.pointerEvents = 'auto';
                if (submitButton) submitButton.style.pointerEvents = 'auto';
              }
            }
          }
        );
      }
      return null;
    }

    // Immediately set visibility to ensure section can be interacted with
    if (trailContainer) {
      console.log("Trail container found:", trailContainer);
      // Make container visible but transparent initially
      trailContainer.style.visibility = 'visible';
      trailContainer.style.pointerEvents = 'auto';
    } else {
      console.error("Trail container not found with ID #trail-container");
      return null;
    }

    // Create observer for the trail section
    observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting;
        const intersectionRatio = entries[0].intersectionRatio;
        
        console.log("Trail section intersection:", {
          isIntersecting,
          intersectionRatio,
          element: entries[0].target
        });
        
        if (isIntersecting && intersectionRatio >= 0.3) {
          // Only initialize if it hasn't been initialized yet
          if (!imageTrail) {
            console.log("Initializing image trail");
            
            // Ensure images are properly loaded with the correct path
            // In development environments, use relative paths
            const allImageSources = [];
            
            // Add all 35 images to the array with proper paths
            for (let i = 1; i <= 35; i++) {
              allImageSources.push(`/img${i}.jpeg`);
            }
            
            try {
              // Create new ImageTrail instance with full image paths
              imageTrail = new ImageTrail({
                containerId: "trail-container",
                images: allImageSources,
                imageCount: 35,
                imageLifespan: 750,
                removalDelay: 50,
                mouseThreshold: 100,
                scrollThreshold: 50,
                idleCursorInterval: 300,
                inDuration: 750,
                outDuration: 1000,
                inEasing: "cubic-bezier(.07,.5,.5,1)",
                outEasing: "cubic-bezier(.87, 0, .13, 1)"
              });
              
              // Initialize with the correct container ID
              imageTrail.initialize("#trail-container");
              
              // Animate the trail section
              gsap.to('.trail-section', { 
                autoAlpha: 1, 
                duration: 0.5,
                ease: 'power1.inOut'
              });
              
              // Animate the content
              gsap.fromTo('.trail-section-content', 
                { opacity: 0, y: 50 },
                { 
                  opacity: 1, 
                  y: 0, 
                  duration: 1, 
                  ease: 'power3.out',
                  onComplete: () => {
                    // Ensure form is interactive after animation
                    const form = document.getElementById('waitlist-form');
                    if (form) {
                      form.style.pointerEvents = 'auto';
                      const emailInput = document.getElementById('email-input');
                      const submitButton = document.getElementById('submit-button');
                      if (emailInput) emailInput.style.pointerEvents = 'auto';
                      if (submitButton) submitButton.style.pointerEvents = 'auto';
                      console.log("Form should be interactive now");
                    }
                  }
                }
              );
            } catch (error) {
              console.error("Error initializing image trail:", error);
            }
          }
        } else if (!isIntersecting && imageTrail) {
          // Destroy trail when section goes out of view
          console.log("Destroying image trail");
          imageTrail.destroy();
          imageTrail = null;
        }
      },
      { threshold: [0, 0.3, 0.5, 0.7, 1] }
    );

    // Start observing the trail section itself, not just the container
    if (trailSection) {
      console.log("Starting to observe trail section");
      observer.observe(trailSection);
    } else {
      console.error("Trail section not found");
    }
    
    // Handle window resize - destroy trail on mobile
    window.addEventListener('resize', () => {
      const isMobileNow = window.innerWidth <= 768;
      
      if (isMobileNow && imageTrail) {
        console.log("Resized to mobile - destroying image trail");
        imageTrail.destroy();
        imageTrail = null;
        
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      } else if (!isMobileNow && !imageTrail && trailSection && isElementInViewport(trailSection)) {
        // Reinitialize if resized to desktop and section is in view
        initializeImageTrail();
      }
    });
    
    // Return a cleanup function
    return function cleanup() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      
      if (imageTrail) {
        imageTrail.destroy();
        imageTrail = null;
      }
    };
  }

  // Helper function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Initialize components and store cleanup functions
  const cleanupFunctions = {
    imageTrail: initializeImageTrail(),
  };

  function initializeScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const trailSection = document.querySelector('.trail-section');
    
    scrollIndicator.addEventListener('click', () => {
      trailSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Initialize form handling
  function initializeFormHandling() {
    const form = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('email-input');
    const submitButton = document.getElementById('submit-button');
    const successMessage = document.getElementById('form-success');
    const trailContainer = document.getElementById('trail-container');

    if (!form || !emailInput || !submitButton) {
      console.error('Form elements not found');
      return;
    }

    // Ensure trail container doesn't interfere with form
    if (trailContainer) {
      trailContainer.style.pointerEvents = 'none';
    }

    // Ensure form elements are interactive
    form.style.pointerEvents = 'auto';
    emailInput.style.pointerEvents = 'auto';
    submitButton.style.pointerEvents = 'auto';

    // Add event listeners for form interaction
    emailInput.addEventListener('focus', () => {
      emailInput.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
    });

    emailInput.addEventListener('blur', () => {
      emailInput.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      
      if (email && isValidEmail(email)) {
        // Add loading state to button
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        // Simulate API call with a slight delay
        setTimeout(() => {
          // Show success message with enhanced animation
          const successMessage = document.getElementById('form-success');
          successMessage.classList.add('active');
          
          // Animate the success message with a more engaging sequence
          gsap.timeline()
            .fromTo(successMessage,
              { 
                opacity: 0,
                y: 20,
                scale: 0.95
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
                onComplete: () => {
                  // Add a subtle hover effect
                  successMessage.addEventListener('mouseenter', () => {
                    gsap.to(successMessage, {
                      scale: 1.02,
                      duration: 0.3,
                      ease: 'power2.out'
                    });
                  });
                  
                  successMessage.addEventListener('mouseleave', () => {
                    gsap.to(successMessage, {
                      scale: 1,
                      duration: 0.3,
                      ease: 'power2.out'
                    });
                  });
                }
              }
            )
            .fromTo(successMessage.querySelector('p'),
              {
                opacity: 0,
                x: -20
              },
              {
                opacity: 1,
                x: 0,
                duration: 0.5,
                ease: 'power2.out'
              },
              '-=0.3'
            );
          
          // Reset form and button state after animation
          setTimeout(() => {
            emailInput.value = '';
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            
            // Hide success message after 3 seconds with a smooth fade-out
            setTimeout(() => {
              gsap.to(successMessage, {
                opacity: 0,
                y: -10,
                scale: 0.95,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                  successMessage.classList.remove('active');
                }
              });
            }, 3000);
          }, 100);
        }, 800); // Simulated API delay
      }
    });

    // Add click event listener to ensure form is interactive
    form.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Add mouse events to ensure form elements are interactive
    emailInput.addEventListener('mouseenter', () => {
      emailInput.style.cursor = 'text';
    });

    submitButton.addEventListener('mouseenter', () => {
      submitButton.style.cursor = 'pointer';
    });
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Add window unload handler to clean up everything
  window.addEventListener('beforeunload', () => {
    Object.values(cleanupFunctions).forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
  });
});

// Debug function to directly test form functionality
function testFormFunctionality() {
  console.log('Testing form functionality...');
  const form = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('email-input');
  const submitButton = document.getElementById('submit-button');
  
  if (form && emailInput && submitButton) {
    console.log('Form elements found:');
    console.log('- Form:', form);
    console.log('- Email input:', emailInput);
    console.log('- Submit button:', submitButton);
    
    // Make sure elements are interactive
    emailInput.style.pointerEvents = 'auto';
    submitButton.style.pointerEvents = 'auto';
    
    // Add direct event listeners for debugging
    emailInput.addEventListener('focus', () => {
      console.log('Email input focused');
    });
    
    emailInput.addEventListener('input', () => {
      console.log('Email input value changed:', emailInput.value);
    });
    
    submitButton.addEventListener('click', (e) => {
      console.log('Submit button clicked');
    });
    
    form.addEventListener('submit', (e) => {
      console.log('Form submitted via debug listener');
    });
  } else {
    console.error('One or more form elements not found:');
    console.log('- Form:', !!form);
    console.log('- Email input:', !!emailInput);
    console.log('- Submit button:', !!submitButton);
  }
}
