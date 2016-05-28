class PDFPattern
  constructor: (@doc, @bbox, @xstep, @ystep, @stream, @colored) ->
    @transform = [1, 0, 0, 1, 0, 0]

  embed: ->
    return if @id && @doc.page.patterns[@id]

    @id = 'P' + (++@doc._patternCount) unless @id

    unless @pattern
      # apply Pattern transform to existing document ctm
      m = @doc._ctm.slice()
      [m0, m1, m2, m3, m4, m5] = m
      [m11, m12, m21, m22, dx, dy] = @transform
      m[0] = m0 * m11 + m2 * m12
      m[1] = m1 * m11 + m3 * m12
      m[2] = m0 * m21 + m2 * m22
      m[3] = m1 * m21 + m3 * m22
      m[4] = m0 * dx + m2 * dy + m4
      m[5] = m1 * dx + m3 * dy + m5

      @pattern = @doc.ref
        Type: 'Pattern',
        PatternType: 1,
        PaintType: if @colored then 1 else 2           # 1-colored, 2-uncolored,
        TilingType: 2,
        BBox: @bbox,
        XStep: @xstep,
        YStep: @ystep,
        Matrix: (+v.toFixed(5) for v in m)
      @pattern.end(@stream)
    @doc.page.patterns[@id] = @pattern

  apply: (stroke, color = null) ->
    @embed()
    @doc._embedPatternColorSpaces()

    op = if stroke then 'SCN' else 'scn'

    if @colored
      # colored pattern
      @doc._setColorSpace('Pattern', stroke)
      @doc.addContent "/#{@id} #{op}"
    else
      # uncolored pattern
      color = 'black' unless color?
      color = @doc._normalizeColor(color)
      if @doc._isPatternColor(color)
        throw new Error "uncolored pattern must be colored with non-pattern color"
      csId = @doc._getPatternColorSpace(color)
      @doc._setColorSpace(csId, stroke)
      @doc.addContent "#{color.join ' '} /#{@id} #{op}"

module.exports = {PDFPattern}
