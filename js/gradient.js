// Generated by CoffeeScript 1.12.7
(function() {
  var PDFGradient, PDFLinearGradient, PDFRadialGradient,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PDFGradient = (function() {
    function PDFGradient(doc) {
      this.doc = doc;
      this.stops = [];
      this.embedded = false;
      this.transform = [1, 0, 0, 1, 0, 0];
      this._colorSpace = 'DeviceRGB';
    }

    PDFGradient.prototype.stop = function(pos, color, opacity) {
      if (opacity == null) {
        opacity = 1;
      }
      opacity = Math.max(0, Math.min(1, opacity));
      this.stops.push([pos, this.doc._normalizeColor(color), opacity]);
      return this;
    };

    PDFGradient.prototype.embed = function() {
      var bounds, dx, dy, encode, fn, form, grad, group, gstate, i, j, k, last, len, m, m0, m1, m11, m12, m2, m21, m22, m3, m4, m5, name, pattern, ref, ref1, ref2, resources, sMask, shader, stop, stops, v;
      if (this.embedded || this.stops.length === 0) {
        return;
      }
      this.embedded = true;
      last = this.stops[this.stops.length - 1];
      if (last[0] < 1) {
        this.stops.push([1, last[1], last[2]]);
      }
      bounds = [];
      encode = [];
      stops = [];
      for (i = j = 0, ref = this.stops.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        encode.push(0, 1);
        if (i + 2 !== this.stops.length) {
          bounds.push(this.stops[i + 1][0]);
        }
        fn = this.doc.ref({
          FunctionType: 2,
          Domain: [0, 1],
          C0: this.stops[i + 0][1],
          C1: this.stops[i + 1][1],
          N: 1
        });
        stops.push(fn);
        fn.end();
      }
      if (stops.length === 1) {
        fn = stops[0];
      } else {
        fn = this.doc.ref({
          FunctionType: 3,
          Domain: [0, 1],
          Functions: stops,
          Bounds: bounds,
          Encode: encode
        });
        fn.end();
      }
      this.id = 'Sh' + (++this.doc._gradCount);
      m = this.doc._ctm.slice();
      m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5];
      ref1 = this.transform, m11 = ref1[0], m12 = ref1[1], m21 = ref1[2], m22 = ref1[3], dx = ref1[4], dy = ref1[5];
      m[0] = m0 * m11 + m2 * m12;
      m[1] = m1 * m11 + m3 * m12;
      m[2] = m0 * m21 + m2 * m22;
      m[3] = m1 * m21 + m3 * m22;
      m[4] = m0 * dx + m2 * dy + m4;
      m[5] = m1 * dx + m3 * dy + m5;
      shader = this.shader(fn);
      shader.end();
      pattern = this.doc.ref({
        Type: 'Pattern',
        PatternType: 2,
        Shading: shader,
        Matrix: (function() {
          var k, len, results;
          results = [];
          for (k = 0, len = m.length; k < len; k++) {
            v = m[k];
            results.push(+v.toFixed(5));
          }
          return results;
        })()
      });
      this.doc.page.patterns[this.id] = pattern;
      pattern.end();
      if (this.stops.some(function(stop) {
        return stop[2] < 1;
      })) {
        grad = this.opacityGradient();
        grad._colorSpace = 'DeviceGray';
        ref2 = this.stops;
        for (k = 0, len = ref2.length; k < len; k++) {
          stop = ref2[k];
          grad.stop(stop[0], [stop[2]]);
        }
        grad = grad.embed();
        group = this.doc.ref({
          Type: 'Group',
          S: 'Transparency',
          CS: 'DeviceGray'
        });
        group.end();
        resources = this.doc.ref({
          ProcSet: ['PDF', 'Text', 'ImageB', 'ImageC', 'ImageI'],
          Shading: {
            Sh1: grad.data.Shading
          }
        });
        resources.end();
        form = this.doc.ref({
          Type: 'XObject',
          Subtype: 'Form',
          FormType: 1,
          BBox: [0, 0, this.doc.page.width, this.doc.page.height],
          Group: group,
          Resources: resources
        });
        form.end("/Sh1 sh");
        sMask = this.doc.ref({
          Type: 'Mask',
          S: 'Luminosity',
          G: form
        });
        sMask.end();
        gstate = this.doc.ref({
          Type: 'ExtGState',
          SMask: sMask
        });
        this.opacity_id = ++this.doc._opacityCount;
        name = "Gs" + this.opacity_id;
        this.doc.page.ext_gstates[name] = gstate;
        gstate.end();
      }
      return pattern;
    };

    PDFGradient.prototype.apply = function(stroke) {
      var op;
      if (!this.embedded) {
        this.embed();
      }
      this.doc._setColorSpace('Pattern', stroke);
      op = stroke ? 'SCN' : 'scn';
      this.doc.addContent("/" + this.id + " " + op);
      if (this.opacity_id) {
        this.doc.addContent("/Gs" + this.opacity_id + " gs");
        return this.doc._sMasked = true;
      }
    };

    return PDFGradient;

  })();

  PDFLinearGradient = (function(superClass) {
    extend(PDFLinearGradient, superClass);

    function PDFLinearGradient(doc, x1, y1, x2, y2) {
      this.doc = doc;
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      PDFLinearGradient.__super__.constructor.apply(this, arguments);
    }

    PDFLinearGradient.prototype.shader = function(fn) {
      return this.doc.ref({
        ShadingType: 2,
        ColorSpace: this._colorSpace,
        Coords: [this.x1, this.y1, this.x2, this.y2],
        Function: fn,
        Extend: [true, true]
      });
    };

    PDFLinearGradient.prototype.opacityGradient = function() {
      return new PDFLinearGradient(this.doc, this.x1, this.y1, this.x2, this.y2);
    };

    return PDFLinearGradient;

  })(PDFGradient);

  PDFRadialGradient = (function(superClass) {
    extend(PDFRadialGradient, superClass);

    function PDFRadialGradient(doc, x1, y1, r1, x2, y2, r2) {
      this.doc = doc;
      this.x1 = x1;
      this.y1 = y1;
      this.r1 = r1;
      this.x2 = x2;
      this.y2 = y2;
      this.r2 = r2;
      PDFRadialGradient.__super__.constructor.apply(this, arguments);
    }

    PDFRadialGradient.prototype.shader = function(fn) {
      return this.doc.ref({
        ShadingType: 3,
        ColorSpace: this._colorSpace,
        Coords: [this.x1, this.y1, this.r1, this.x2, this.y2, this.r2],
        Function: fn,
        Extend: [true, true]
      });
    };

    PDFRadialGradient.prototype.opacityGradient = function() {
      return new PDFRadialGradient(this.doc, this.x1, this.y1, this.r1, this.x2, this.y2, this.r2);
    };

    return PDFRadialGradient;

  })(PDFGradient);

  module.exports = {
    PDFGradient: PDFGradient,
    PDFLinearGradient: PDFLinearGradient,
    PDFRadialGradient: PDFRadialGradient
  };

}).call(this);
