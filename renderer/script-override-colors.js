window.onload = function () {
  console.log("I am therre")
  const COLOR_MAP = {
    '#1E1E1E': '#FFFFFF',
    '#000000': '#1A1A1A'
  };

  // 2. Safely grab the native property descriptor
  const descriptor = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');

  if (descriptor && descriptor.set) {
    const originalSetter = descriptor.set;

    Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
      set(val) {
        // Normalize string inputs to uppercase hex strings
        const key = typeof val === 'string' ? val.trim().toUpperCase() : val;
        
        // Pass either the swapped color or the raw input back to native setter
        originalSetter.call(this, COLOR_MAP[key] || val);
      },
      get() {
        return descriptor.get.call(this);
      }
    });
  }
};