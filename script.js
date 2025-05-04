import { servicesCopy } from "./services.js";
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
  //the effect is multiple servicees only noe image and text that changes with animation !
  const stickySection = document.querySelector(".sticky");
  const stickyHeight = window.innerHeight * 8; //the end animation
  const services = document.querySelectorAll(".service");
  const indicator = document.querySelector(".indicator");
  const currentCount = document.querySelector("#current-count"); //to update pagination
  const serviceImg = document.querySelector(".service-img"); //the wrapper that includes all the images
  const serviceCopy = document.querySelector(".service-copy p"); //the text that will change as long as the image changes s
  const serviceHeight = 38;
  const imgHeight = 250;

  serviceCopy.textContent = servicesCopy[0][0];
  let currentSplitText = new SplitType(serviceCopy, { types: "lines" });

  const measureContainer = document.createElement("div");
  measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: auto;
      width: auto;
      white-space: nowrap;
      font-family: "PP NeueBit";
      font-size: 60px;
      font-weight: 600;
      text-transform: uppercase;
  `;
  //this is just a temprary container to measure the width of the text
  document.body.appendChild(measureContainer);
  //for each service i will measure the width of the text
  //and set the width of the indicator to be the same as the text
  //this will be used to animate the indicator
  const serviceWidths = Array.from(services).map((service) => {
    measureContainer.textContent = service.querySelector("p").textContent; // i added a textt to the measure so that i can measure the width of the text
    return measureContainer.offsetWidth + 19;
  });

  document.body.removeChild(measureContainer);
  // we will set the indicator to be the first text active by default
  gsap.set(indicator, {
    width: serviceWidths[0],
    xPercent: -50,
    left: "50%", //center the indicator
  });
  // عاوزين السكشن يخصله بي نلمده 8 سكاشن ويندو ف انا هعتبر اني عديت سكشن بمجرد ما اعدي وحده واحده من ده
  const scrollPerService = window.innerHeight;
  let currentIndex = 0;

  const animateTextChange = (index) => {
    return new Promise((resolve) => {
      gsap.to(currentSplitText.lines, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.025,
        ease: "power3.inOut",
        onComplete: () => {
          currentSplitText.revert();

          const newText = servicesCopy[index][0];
          serviceCopy.textContent = newText;

          currentSplitText = new SplitType(serviceCopy, {
            types: "lines",
          });

          gsap.set(currentSplitText.lines, {
            opacity: 0,
            y: 20,
          });

          gsap.to(currentSplitText.lines, {
            opacity: 1,
            y: 0,
            duration: 0.25,
            stagger: 0.025,
            ease: "power3.out",
            onComplete: resolve,
          });
        },
      });
    });
  };

  ScrollTrigger.create({
    trigger: stickySection,
    start: "top top",
    end: `${stickyHeight}px`,
    pin: true,
    onUpdate: async (self) => {
      const progress = self.progress; //how much progress from the start of the trigger to the end of the trigger
      gsap.set(".progress", { scaleY: progress });
      //self.scroll() is how much the user has scrolled from the start of the trigger and window.innerHeight is the height of the window in the screen
      //so we will subtract the window height from the scroll position to get the scroll position of the current service
      // احنا عاوزين نبدا حساب البروجرس من بدايه السكشن الي عملناله بيننينج من هنا مش من بدايه الويندو خاالص
      const scrollPosition = Math.max(0, self.scroll() - window.innerHeight);
      console.log(scrollPosition, self.scroll(), window.innerHeight);
      const activeIndex = Math.floor(scrollPosition / scrollPerService);

      if (activeIndex >= 0 && activeIndex < services.length && currentIndex !== activeIndex) {
        //check for the active index to be in the range of the services
        //this is to prevent the animation from running if the active index is the same as the current index
        currentIndex = activeIndex;

        services.forEach((service) => service.classList.remove("active"));
        services[activeIndex].classList.add("active");

        await Promise.all([
          // عن طريق الاكتف ايندكس هتقدر تحسب الهايت الي هينزله الانديكتور
          // والعرض بتاه
          gsap.to(indicator, {
            y: activeIndex * serviceHeight,
            width: serviceWidths[activeIndex],
            duration: 0.3,
            ease: "power3.inOut",
            overwrite: true,
          }),

          gsap.to(serviceImg, {
            y: -(activeIndex * imgHeight),
            duration: 0.3,
            ease: "power3.inOut",
            overwrite: true,
          }),

          gsap.to(currentCount, {
            innerText: activeIndex + 1,
            snap: { innerText: 1 },
            duration: 0.3,
            ease: "power3.out",
          }),

          animateTextChange(activeIndex),
        ]);
      }
    },
  });
});
