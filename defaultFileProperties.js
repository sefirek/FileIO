// class defaultFileProperties {
//   constructor() {
//     this.overrideFiles = false;
//     this.fileExistsError = false;
//     this.dirExistsError = false;
//   }
// }

/**
 *
 */
function DefaultFileProperties() {
  this.overrideFiles = false;
  this.fileExistsError = false;
  this.dirExistsError = false;
}

module.exports = new DefaultFileProperties();
