//在没一个请求响应头添加参数，表示Extjs Ajax请求
Ext.Ajax.on('beforerequest', function(conn, options) {
	if (options.params == null)
		options.params = {};

	// 清楚提交为空参数
	for ( var k in options.params) {
		// start为分页参数，不能被清除掉
		if (options.params[k] === "" && k != "start")
			delete options.params[k];
	}

	options.params["REQUEST_MODE"] = "AJAX";
});

// Ajax请求完成执行。判断Session超时，如果超时或者无效，返回的内容为login.jsp页面的内容,页面包含：AJAX-AccessDeniedException
// 如果页面包含AJAX-AccessDeniedException，说明session超时或者无效。
Ext.Ajax.on('requestcomplete',
		function(conn, response, options) {
			if (options.params['REQUEST_MODE'] == "AJAX"
					&& response.responseText
							.indexOf("AJAX-AccessDeniedException") != -1) {
				Ext.Msg.alert('提示', '会话超时，请重新登录!', function() {
					window.location = './login';
				});
			}
		});

var infoTrace;
Ext.Ajax
		.on(
				'requestexception',
				function(conn, response, options) {
					// ajax请求，出现异常，弹出窗口提示信息。
					// var json =
					// response.responseText.replace("</generated></generated>",
					// "");
					if (response.status == "404") {
						Ext.Msg.alert('提示', "请求URI：<b>" + options.url
								+ "</b> 不存在");
					} else {
						if (response.statusText == 'communication failure') {
							Ext.Msg.alert('提示', "连接服务器失败，请联系管理员！");
						} else {
							var json = response.responseText;
							var data = Ext.decode(json);
							infoTrace = data.execptionTrace;
							Ext.Msg
									.alert(
											'提示',
											"请求URI："
													+ data.requestURI
													+ "<br>错误信息："
													+ data.message
													+ "<br><a href=javascript:void(0) onclick='showTrace()'>错误堆栈信息</a>",
											function() {
											});
						}
					}
					return false;
				});

function showTrace() {

	var traceWin = new Ext.Window({
		animCollapse : true,
		title : "错误堆栈信息",
		width : 900,
		height : 400,
		resizable : false,
		items : [ new Ext.form.TextArea({
			autoScroll : true,
			value : infoTrace,
			width : 890,
			height : 370,
			readOnly : true
		}) ]
	});

	traceWin.show();

}

Ext.onReady(function() {
	// 这个是禁用鼠标右键
	function stop() {
		return false;
	}
	document.oncontextmenu = stop;
});

Ext.namespace("ST.util");
ST.util.CONTEXT_PATH = "/resource/";

ST.util.genWindow = function(c) {
	if (c.id && Ext.getCmp(c.id)) {
		Ext.getCmp(c.id).center();
		return;
	}
	var win = new Ext.Window(Ext.apply({
		closable : true,
		border : false,
		width : 640,
		height : 520,
		modal : true,
		plain : true,
		maximizable : true,
		items : [],
		layout : 'fit'
	}, c));
	win.show();
	win.center();
	return win;
};

/**
 * 判断操作权限
 */
var __OPERATIONIDS = null;
ST.util.isAuthOperation = function(code) {
	return true;
};

ST.util.setFormValues = function(formId, obj) {
	var form = Ext.get(formId).dom;
	var fElements = form.elements;

	Ext.each(fElements, function(element) {
		for (name in obj) {
			if (element.name == name) {
				element.value = obj[name];
				return;
			}
		}
	});
};

Ext.ux.PanelCollapsedTitle = (function() {
	var rotatedCls = 'x-panel-header-rotated';
	var supportsSVG = !!document.implementation.hasFeature(
			"http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
	var patchCollapsedElem = function() {
		var verticalText = ((this.region == 'east') || (this.region == 'west'));
		var containerStyle = 'overflow: visible; padding: 0; border: none; background: none;';
		if (verticalText && supportsSVG) {
			this.collapsedHeader = this.ownerCt.layout[this.region]
					.getCollapsedEl().createChild({
						tag : 'div',
						style : 'height: 100%; overflow: hidden;'
					});
			var SVGNS = 'http://www.w3.org/2000/svg';
			var svg = document.createElementNS(SVGNS, 'svg');
			this.collapsedHeader.dom.appendChild(svg);
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');
			var textContainer = document.createElementNS(SVGNS, 'text');
			textContainer.setAttribute('x', 6);
			textContainer.setAttribute('y', 1);
			textContainer.setAttribute('transform', 'rotate(90 6 1)');
			textContainer.setAttribute('class', 'x-panel-header ' + rotatedCls);
			svg.appendChild(textContainer);
			this.collapsedHeaderText = document.createTextNode(this.title);
			textContainer.appendChild(this.collapsedHeaderText);
			var color = Ext.fly(textContainer).getStyle('color');
			textContainer.setAttribute('style', containerStyle + ';fill: '
					+ color + ';');
		} else {
			var titleElemStyle = 'position: relative;';
			if (verticalText) {
				titleElemStyle += 'white-space: nowrap; writing-mode: tb-rl; top: 1px; left: 3px;';
			} else {
				titleElemStyle += 'top: 2px;';
				containerStyle += 'padding-left: 4px; margin-right: 18px;';
			}
			;
			this.collapsedHeader = this.ownerCt.layout[this.region]
					.getCollapsedEl().createChild(
							{
								tag : 'div',
								style : containerStyle,
								cls : 'x-panel-header ' + rotatedCls,
								html : '<span style="' + titleElemStyle + '">'
										+ this.title + '</span>'
							});
			this.collapsedHeaderText = this.collapsedHeader.first();
		}
		;
		if (this.collapsedIconCls)
			this.setCollapsedIconClass(this.collapsedIconCls);
	};
	this.init = function(p) {
		if (p.collapsible) {
			var verticalText = ((p.region == 'east') || (p.region == 'west'));
			p.setTitle = Ext.Panel.prototype.setTitle
					.createSequence(function(t) {
						if (this.rendered && this.collapsedHeaderText) {
							if (this.collapsedHeaderText.dom) {
								this.collapsedHeaderText.dom.innerHTML = t;
							} else if (this.collapsedHeaderText.replaceData) {
								this.collapsedHeaderText.nodeValue = t;
							}
							;
						}
						;
					});
			p.setCollapsedIconClass = function(cls) {
				var old = this.collapsedIconCls;
				this.collapsedIconCls = cls;
				if (this.rendered && this.collapsedHeader) {
					var hd = this.collapsedHeader, img = hd
							.child('img.x-panel-inline-icon');
					if (img) {
						if (this.collapsedIconCls) {
							Ext.fly(img).replaceClass(old,
									this.collapsedIconCls);
						} else {
							Ext.fly(img).remove();
						}
						;
					} else if (this.collapsedIconCls) {
						Ext.DomHelper
								.insertBefore(
										hd.dom.firstChild,
										{
											tag : 'img',
											src : Ext.BLANK_IMAGE_URL,
											cls : 'x-panel-inline-icon '
													+ this.collapsedIconCls,
											style : verticalText ? 'display: block; margin: 1px 2px;'
													: 'margin-top: 2px; margin-right: 4px'
										});
					}
					;
				}
				;
			};
			p.on('render', function() {
				if (this.ownerCt.rendered && this.ownerCt.layout.hasLayout) {
					patchCollapsedElem.call(p);
				} else {
					this.ownerCt.on('afterlayout', patchCollapsedElem, p, {
						single : true
					});
				}
				;
			}, p);
		}
	};
	return this;
})();
Ext.ns('Ext.ux.grid');
Ext.ux.grid.RowExpander = Ext
		.extend(
				Ext.util.Observable,
				{
					expandOnEnter : true,
					expandOnDblClick : true,
					header : '',
					width : 20,
					sortable : false,
					fixed : true,
					hideable : false,
					menuDisabled : true,
					dataIndex : '',
					id : 'expander',
					lazyRender : true,
					enableCaching : true,
					constructor : function(config) {
						Ext.apply(this, config);
						this.addEvents({
							beforeexpand : true,
							expand : true,
							beforecollapse : true,
							collapse : true
						});
						Ext.ux.grid.RowExpander.superclass.constructor
								.call(this);
						if (this.tpl) {
							if (typeof this.tpl == 'string') {
								this.tpl = new Ext.Template(this.tpl);
							}
							this.tpl.compile();
						}
						this.state = {};
						this.bodyContent = {};
					},
					getRowClass : function(record, rowIndex, p, ds) {
						p.cols = p.cols - 1;
						var content = this.bodyContent[record.id];
						if (!content && !this.lazyRender) {
							content = this.getBodyContent(record, rowIndex);
						}
						if (content) {
							p.body = content;
						}
						return this.state[record.id] ? 'x-grid3-row-expanded'
								: 'x-grid3-row-collapsed';
					},
					init : function(grid) {
						this.grid = grid;
						var view = grid.getView();
						view.getRowClass = this.getRowClass
								.createDelegate(this);
						view.enableRowBody = true;
						grid.on('render', this.onRender, this);
						grid.on('destroy', this.onDestroy, this);
					},
					onRender : function() {
						var grid = this.grid;
						var mainBody = grid.getView().mainBody;
						mainBody.on('mousedown', this.onMouseDown, this, {
							delegate : '.x-grid3-row-expander'
						});
						if (this.expandOnEnter) {
							this.keyNav = new Ext.KeyNav(this.grid.getGridEl(),
									{
										'enter' : this.onEnter,
										scope : this
									});
						}
						if (this.expandOnDblClick) {
							grid.on('rowdblclick', this.onRowDblClick, this);
						}
					},
					onDestroy : function() {
						if (this.keyNav) {
							this.keyNav.disable();
							delete this.keyNav;
						}
						var mainBody = this.grid.getView().mainBody;
						if (mainBody) {
							mainBody.un('mousedown', this.onMouseDown, this);
						}
					},
					onRowDblClick : function(grid, rowIdx, e) {
						this.toggleRow(rowIdx);
					},
					onEnter : function(e) {
						var g = this.grid;
						var sm = g.getSelectionModel();
						var sels = sm.getSelections();
						for ( var i = 0, len = sels.length; i < len; i++) {
							var rowIdx = g.getStore().indexOf(sels[i]);
							this.toggleRow(rowIdx);
						}
					},
					getBodyContent : function(record, index) {
						if (!this.enableCaching) {
							return this.tpl.apply(record.data);
						}
						var content = this.bodyContent[record.id];
						if (!content) {
							content = this.tpl.apply(record.data);
							this.bodyContent[record.id] = content;
						}
						return content;
					},
					onMouseDown : function(e, t) {
						e.stopEvent();
						var row = e.getTarget('.x-grid3-row');
						this.toggleRow(row);
					},
					renderer : function(v, p, record) {
						p.cellAttr = 'rowspan="2"';
						return '<div class="x-grid3-row-expander">&#160;</div>';
					},
					beforeExpand : function(record, body, rowIndex) {
						if (this.fireEvent('beforeexpand', this, record, body,
								rowIndex) !== false) {
							if (this.tpl && this.lazyRender) {
								body.innerHTML = this.getBodyContent(record,
										rowIndex);
							}
							return true;
						} else {
							return false;
						}
					},
					toggleRow : function(row) {
						if (typeof row == 'number') {
							row = this.grid.view.getRow(row);
						}
						this[Ext.fly(row).hasClass('x-grid3-row-collapsed') ? 'expandRow'
								: 'collapseRow'](row);
					},
					expandRow : function(row) {
						if (typeof row == 'number') {
							row = this.grid.view.getRow(row);
						}
						var record = this.grid.store.getAt(row.rowIndex);
						var body = Ext.DomQuery.selectNode(
								'tr:nth(2) div.x-grid3-row-body', row);
						if (this.beforeExpand(record, body, row.rowIndex)) {
							this.state[record.id] = true;
							Ext.fly(row).replaceClass('x-grid3-row-collapsed',
									'x-grid3-row-expanded');
							this.fireEvent('expand', this, record, body,
									row.rowIndex);
						}
					},
					collapseRow : function(row) {
						if (typeof row == 'number') {
							row = this.grid.view.getRow(row);
						}
						var record = this.grid.store.getAt(row.rowIndex);
						var body = Ext.fly(row).child(
								'tr:nth(1) div.x-grid3-row-body', true);
						if (this.fireEvent('beforecollapse', this, record,
								body, row.rowIndex) !== false) {
							this.state[record.id] = false;
							Ext.fly(row).replaceClass('x-grid3-row-expanded',
									'x-grid3-row-collapsed');
							this.fireEvent('collapse', this, record, body,
									row.rowIndex);
						}
					}
				});
Ext.preg('rowexpander', Ext.ux.grid.RowExpander);
Ext.grid.RowExpander = Ext.ux.grid.RowExpander;
Ext.namespace("Ext.ux.layout");
Ext.ux.layout.TableFormLayout = Ext.extend(Ext.layout.TableLayout, {
    monitorResize: true,
    setContainer: function() {
        Ext.layout.FormLayout.prototype.setContainer.apply(this, arguments);
        this.currentRow = 0;
        this.currentColumn = 0;
        this.cells = [];
    },
    renderItem : function(c, position, target) {
        if (c && !c.rendered) {
            var cell = Ext.get(this.getNextCell(c));
            cell.addClass("x-table-layout-column-" + this.currentColumn);
            Ext.layout.FormLayout.prototype.renderItem.call(this, c, 0, cell);
        }
    },
    getLayoutTargetSize : Ext.layout.AnchorLayout.prototype.getLayoutTargetSize,
    getTemplateArgs : Ext.layout.FormLayout.prototype.getTemplateArgs,
    onLayout : function(ct, target) {
        Ext.ux.layout.TableFormLayout.superclass.onLayout.call(this, ct, target);
        if (!target.hasClass("x-table-form-layout-ct")) {
            target.addClass("x-table-form-layout-ct");
        }
        var viewSize = this.getLayoutTargetSize(ct, target);
        var aw, ah;
        if (ct.anchorSize) {
            if (typeof ct.anchorSize == "number") {
                aw = ct.anchorSize;
            } else {
                aw = ct.anchorSize.width;
                ah = ct.anchorSize.height;
            }
        } else {
            aw = ct.initialConfig.width;
            ah = ct.initialConfig.height;
        }

        var cs = this.getRenderedItems(ct), len = cs.length, i, c, a, cw, ch, el, vs, boxes = [];
        var x, w, h, col, colWidth, offset;
        for (i = 0; i < len; i++) {
            c = cs[i];
            // get table cell
            x = c.getEl().parent(".x-table-layout-cell");
            if (this.columnWidths) {
                // get column
                col = parseInt(x.dom.className.replace(/.*x\-table\-layout\-column\-([\d]+).*/, "$1"));
                // get cell width (based on column widths)
                colWidth = 0, offset = 0;
                for (j = col; j < (col + (c.colspan || 1)); j++) {
                    colWidth += this.columnWidths[j];
                    offset += 15;
                }
                w = (viewSize.width * colWidth) - offset;
            } else {
                // get cell width
                w = (viewSize.width / this.columns) * (c.colspan || 1);
            }
            // set table cell width
            x.setWidth(w);
            // get cell width (-10 for spacing between cells) & height to be base width of anchored component
            w = w - 10;
            h = x.getHeight();
            // If a child container item has no anchor and no specific width, set the child to the default anchor size
            if (!c.anchor && c.items && !Ext.isNumber(c.width) && !(Ext.isIE6 && Ext.isStrict)){
                c.anchor = this.defaultAnchor;
            }

            if(c.anchor){
                a = c.anchorSpec;
                if(!a){ // cache all anchor values
                    vs = c.anchor.split(' ');
                    c.anchorSpec = a = {
                        right: this.parseAnchor(vs[0], c.initialConfig.width, aw),
                        bottom: this.parseAnchor(vs[1], c.initialConfig.height, ah)
                    };
                }
                cw = a.right ? this.adjustWidthAnchor(a.right(w), c) : undefined;
                ch = a.bottom ? this.adjustHeightAnchor(a.bottom(h), c) : undefined;

                if(cw || ch){
                    boxes.push({
                        comp: c,
                        width: cw || undefined,
                        height: ch || undefined
                    });
                }
            }
        }      
        for (i = 0, len = boxes.length; i < len; i++) {
            c = boxes[i];
            c.comp.setSize(c.width, c.height);
        }      
    },
    
    parseAnchor : function(a, start, cstart) {
        if (a && a != "none") {
            var last;
            if (/^(r|right|b|bottom)$/i.test(a)) {
                var diff = cstart - start;
                return function(v) {
                    if (v !== last) {
                        last = v;
                        return v - diff;
                    }
                };
            } else if (a.indexOf("%") != -1) {
                var ratio = parseFloat(a.replace("%", "")) * .01;
                return function(v) {
                    if (v !== last) {
                        last = v;
                        return Math.floor(v * ratio);
                    }
                };
            } else {
                a = parseInt(a, 10);
                if (!isNaN(a)) {
                    return function(v) {
                        if (v !== last) {
                            last = v;
                            return v + a;
                        }
                    };
                }
            }
        }
        return false;
    },
    adjustWidthAnchor : function(value, comp) {
        return value - (comp.isFormField ? (comp.hideLabel ? 0 : this.labelAdjust) : 0);
    },
    adjustHeightAnchor : function(value, comp) {
        return value;
    },
    // private
    isValidParent : function(c, target){
        return c.getPositionEl().up('table', 6).dom.parentNode === (target.dom || target);
    },
    getLabelStyle : Ext.layout.FormLayout.prototype.getLabelStyle,
    labelSeparator : Ext.layout.FormLayout.prototype.labelSeparator,
    trackLabels: Ext.layout.FormLayout.prototype.trackLabels,
    onFieldShow: Ext.layout.FormLayout.prototype.onFieldShow,
    onFieldHide: Ext.layout.FormLayout.prototype.onFieldHide
});
Ext.Container.LAYOUTS['tableform'] = Ext.ux.layout.TableFormLayout;
Ext.namespace('Ext.ux.plugins');
Ext.ux.plugins.PageComboResizer = Ext.extend(Object, {
	pageSizes : [ 10, 20, 30, 50, 80, 100 ],
	prefixText : '每页显示',
	postfixText : '条记录',
	constructor : function(config) {
		Ext.apply(this, config);
		Ext.ux.plugins.PageComboResizer.superclass.constructor.call(this,
				config);
	},
	init : function(pagingToolbar) {
		var ps = this.pageSizes;
		var combo = new Ext.form.ComboBox({
			typeAhead : true,
			triggerAction : 'all',
			lazyRender : true,
			mode : 'local',
			width : 45,
			store : ps,
			listeners : {
				select : function(c, r, i) {
					pagingToolbar.pageSize = ps[i];
					var rowIndex = 0;
					var gp = pagingToolbar.findParentBy(function(ct, cmp) {
						return (ct instanceof Ext.grid.GridPanel) ? true
								: false;
					});
					var sm = gp.getSelectionModel();
					if (undefined != sm && sm.hasSelection()) {
						if (sm instanceof Ext.grid.RowSelectionModel) {
							rowIndex = gp.store.indexOf(sm.getSelected());
						} else if (sm instanceof Ext.grid.CellSelectionModel) {
							rowIndex = sm.getSelectedCell()[0];
						}
					}
					rowIndex += pagingToolbar.cursor;
					pagingToolbar.doLoad(Math.floor(rowIndex
							/ pagingToolbar.pageSize)
							* pagingToolbar.pageSize);
				}
			}
		});
		Ext.iterate(this.pageSizes, function(ps) {
			if (ps == pagingToolbar.pageSize) {
				combo.setValue(ps);
				return;
			}
		});
		var inputIndex = pagingToolbar.items.indexOf(pagingToolbar.refresh);
		pagingToolbar.insert(++inputIndex, '-');
		pagingToolbar.insert(++inputIndex, this.prefixText);
		pagingToolbar.insert(++inputIndex, combo);
		pagingToolbar.insert(++inputIndex, this.postfixText);
		pagingToolbar.on({
			beforedestroy : function() {
				combo.destroy();
			}
		});
	}
});
Ext.ns('Ext.ux.data');
Ext.ux.data.PagingStore = Ext
		.extend(
				Ext.data.Store,
				{
					add : function(records) {
						records = [].concat(records);
						if (records.length < 1) {
							return;
						}
						for ( var i = 0, len = records.length; i < len; i++) {
							records[i].join(this);
						}
						var index = this.data.length;
						this.data.addAll(records);
						if (this.allData) {
							this.allData.addAll(records);
						}
						if (this.snapshot) {
							this.snapshot.addAll(records);
						}
						this.totalLength += records.length;
						this.fireEvent('add', this, records, index);
					},
					remove : function(record) {
						if (Ext.isArray(record)) {
							Ext.each(record, function(r) {
								this.remove(r);
							}, this);
							return;
						}
						if (this != record.store) {
							return;
						}
						record.join(null);
						var index = this.data.indexOf(record);
						if (index > -1) {
							this.data.removeAt(index);
						}
						if (this.pruneModifiedRecords) {
							this.modified.remove(record);
						}
						if (this.allData) {
							this.allData.remove(record);
						}
						if (this.snapshot) {
							this.snapshot.remove(record);
						}
						this.totalLength--;
						if (index > -1) {
							this.fireEvent('remove', this, record, index);
						}
					},
					removeAll : function(silent) {
						var items = []
								.concat((this.snapshot || this.allData || this.data).items);
						this.clearData();
						if (this.pruneModifiedRecords) {
							this.modified = [];
						}
						this.totalLength = 0;
						if (silent !== true) {
							this.fireEvent('clear', this, items);
						}
					},
					insert : function(index, records) {
						records = [].concat(records);
						for ( var i = 0, len = records.length; i < len; i++) {
							this.data.insert(index, records[i]);
							records[i].join(this);
						}
						if (this.allData) {
							this.allData.addAll(records);
						}
						if (this.snapshot) {
							this.snapshot.addAll(records);
						}
						this.totalLength += records.length;
						this.fireEvent('add', this, records, index);
					},
					getById : function(id) {
						return (this.snapshot || this.allData || this.data)
								.key(id);
					},
					clearData : function() {
						if (this.allData) {
							this.data = this.allData;
							delete this.allData;
						}
						if (this.snapshot) {
							this.data = this.snapshot;
							delete this.snapshot;
						}
						this.data.each(function(rec) {
							rec.join(null);
						});
						this.data.clear();
					},
					execute : function(action, rs, options, batch) {
						if (!Ext.data.Api.isAction(action)) {
							throw new Ext.data.Api.Error('execute', action);
						}
						options = Ext.applyIf(options || {}, {
							params : {}
						});
						if (batch !== undefined) {
							this.addToBatch(batch);
						}
						var doRequest = true;
						if (action === 'read') {
							doRequest = this.fireEvent('beforeload', this,
									options);
							Ext.applyIf(options.params, this.baseParams);
						} else {
							if (this.writer.listful === true
									&& this.restful !== true) {
								rs = (Ext.isArray(rs)) ? rs : [ rs ];
							} else if (Ext.isArray(rs) && rs.length == 1) {
								rs = rs.shift();
							}
							if ((doRequest = this.fireEvent('beforewrite',
									this, action, rs, options)) !== false) {
								this.writer.apply(options.params,
										this.baseParams, action, rs);
							}
						}
						if (doRequest !== false) {
							if (this.writer
									&& this.proxy.url
									&& !this.proxy.restful
									&& !Ext.data.Api.hasUniqueUrl(this.proxy,
											action)) {
								options.params.xaction = action;
							}
							if (action === "read"
									&& this.isPaging(Ext.apply({},
											options.params))) {
								(function() {
									if (this.allData) {
										this.data = this.allData;
										delete this.allData;
									}
									this.applyPaging();
									this.fireEvent("datachanged", this);
									var r = [].concat(this.data.items);
									this.fireEvent("load", this, r, options);
									if (options.callback) {
										options.callback.call(options.scope
												|| this, r, options, true);
									}
								}).defer(1, this);
								return true;
							}
							this.proxy.request(Ext.data.Api.actions[action],
									rs, options.params, this.reader, this
											.createCallback(action, rs, batch),
									this, options);
						}
						return doRequest;
					},
					loadRecords : function(o, options, success) {
						if (this.isDestroyed === true) {
							return;
						}
						if (!o || success === false) {
							if (success !== false) {
								this.fireEvent('load', this, [], options);
							}
							if (options.callback) {
								options.callback.call(options.scope || this,
										[], options, false, o);
							}
							return;
						}
						var r = o.records, t = o.totalRecords || r.length;
						if (!options || options.add !== true) {
							if (this.pruneModifiedRecords) {
								this.modified = [];
							}
							for ( var i = 0, len = r.length; i < len; i++) {
								r[i].join(this);
							}
							this.clearData();
							this.data.addAll(r);
							this.totalLength = t;
							this.applySort();
							if (!this.allData) {
								this.applyPaging();
							}
							if (r.length > this.getCount()) {
								r = [].concat(this.data.items);
							}
							this.fireEvent('datachanged', this);
						} else {
							this.totalLength = Math.max(t, this.data.length
									+ r.length);
							this.add(r);
						}
						this.fireEvent('load', this, r, options);
						if (options.callback) {
							options.callback.call(options.scope || this, r,
									options, true);
						}
					},
					loadData : function(o, append) {
						this.isPaging(Ext.apply({},
								this.lastOptions ? this.lastOptions.params
										: null, this.baseParams));
						var r = this.reader.readRecords(o);
						this.loadRecords(r, {
							add : append
						}, true);
					},
					getTotalCount : function() {
						if (this.allData) {
							return this.allData.getCount();
						}
						return this.totalLength || 0;
					},
					sortData : function() {
						var sortInfo = this.hasMultiSort ? this.multiSortInfo
								: this.sortInfo, direction = sortInfo.direction
								|| "ASC", sorters = sortInfo.sorters, sortFns = [];
						if (!this.hasMultiSort) {
							sorters = [ {
								direction : direction,
								field : sortInfo.field
							} ];
						}
						for ( var i = 0, j = sorters.length; i < j; i++) {
							sortFns.push(this.createSortFunction(
									sorters[i].field, sorters[i].direction));
						}
						if (!sortFns.length) {
							return;
						}
						var directionModifier = direction.toUpperCase() == "DESC" ? -1
								: 1;
						var fn = function(r1, r2) {
							var result = sortFns[0].call(this, r1, r2);
							if (sortFns.length > 1) {
								for ( var i = 1, j = sortFns.length; i < j; i++) {
									result = result
											|| sortFns[i].call(this, r1, r2);
								}
							}
							return directionModifier * result;
						};
						if (this.allData) {
							this.data = this.allData;
							delete this.allData;
						}
						this.data.sort(direction, fn);
						if (this.snapshot && this.snapshot != this.data) {
							this.snapshot.sort(direction, fn);
						}
						this.applyPaging();
					},
					filterBy : function(fn, scope) {
						this.snapshot = this.snapshot || this.allData
								|| this.data;
						this.data = this.queryBy(fn, scope || this);
						this.applyPaging();
						this.fireEvent('datachanged', this);
					},
					clearFilter : function(suppressEvent) {
						if (this.isFiltered()) {
							this.data = this.snapshot;
							delete this.snapshot;
							delete this.allData;
							this.applyPaging();
							if (suppressEvent !== true) {
								this.fireEvent('datachanged', this);
							}
						}
					},
					isFiltered : function() {
						return !!this.snapshot
								&& this.snapshot != (this.allData || this.data);
					},
					queryBy : function(fn, scope) {
						var data = this.snapshot || this.allData || this.data;
						return data.filterBy(fn, scope || this);
					},
					collect : function(dataIndex, allowNull, bypassFilter) {
						var d = (bypassFilter === true ? this.snapshot
								|| this.allData || this.data : this.data).items;
						var v, sv, r = [], l = {};
						for ( var i = 0, len = d.length; i < len; i++) {
							v = d[i].data[dataIndex];
							sv = String(v);
							if ((allowNull || !Ext.isEmpty(v)) && !l[sv]) {
								l[sv] = true;
								r[r.length] = v;
							}
						}
						return r;
					},
					findInsertIndex : function(record) {
						this.suspendEvents();
						var data = this.data.clone();
						this.data.add(record);
						this.applySort();
						var index = this.data.indexOf(record);
						this.data = data;
						this.totalLength--;
						this.resumeEvents();
						return index;
					},
					isPaging : function(params) {
						var pn = this.paramNames, start = params[pn.start], limit = params[pn.limit];
						if ((typeof start != 'number')
								|| (typeof limit != 'number')) {
							delete this.start;
							delete this.limit;
							this.lastParams = params;
							return false;
						}
						this.start = start;
						this.limit = limit;
						delete params[pn.start];
						delete params[pn.limit];
						var lastParams = this.lastParams;
						this.lastParams = params;
						if (!this.proxy) {
							return true;
						}
						if (!lastParams) {
							return false;
						}
						for ( var param in params) {
							if (params.hasOwnProperty(param)
									&& (params[param] !== lastParams[param])) {
								return false;
							}
						}
						for (param in lastParams) {
							if (lastParams.hasOwnProperty(param)
									&& (params[param] !== lastParams[param])) {
								return false;
							}
						}
						return true;
					},
					applyPaging : function() {
						var start = this.start, limit = this.limit;
						if ((typeof start == 'number')
								&& (typeof limit == 'number')) {
							var allData = this.data, data = new Ext.util.MixedCollection(
									allData.allowFunctions, allData.getKey);
							data.items = allData.items.slice(start, start
									+ limit);
							data.keys = allData.keys
									.slice(start, start + limit);
							var len = data.length = data.items.length;
							var map = {};
							for ( var i = 0; i < len; i++) {
								var item = data.items[i];
								map[data.getKey(item)] = item;
							}
							data.map = map;
							this.allData = allData;
							this.data = data;
						}
					}
				});
Ext.ux.data.PagingDirectStore = Ext.extend(Ext.ux.data.PagingStore, {
	constructor : Ext.data.DirectStore.prototype.constructor
});
Ext.reg('pagingdirectstore', Ext.ux.data.PagingDirectStore);
Ext.ux.data.PagingJsonStore = Ext.extend(Ext.ux.data.PagingStore, {
	constructor : Ext.data.JsonStore.prototype.constructor
});
Ext.reg('pagingjsonstore', Ext.ux.data.PagingJsonStore);
Ext.ux.data.PagingXmlStore = Ext.extend(Ext.ux.data.PagingStore, {
	constructor : Ext.data.XmlStore.prototype.constructor
});
Ext.reg('pagingxmlstore', Ext.ux.data.PagingXmlStore);
Ext.ux.data.PagingArrayStore = Ext.extend(Ext.ux.data.PagingStore, {
	constructor : Ext.data.ArrayStore.prototype.constructor,
	loadData : function(data, append) {
		if (this.expandData === true) {
			var r = [];
			for ( var i = 0, len = data.length; i < len; i++) {
				r[r.length] = [ data[i] ];
			}
			data = r;
		}
		Ext.ux.data.PagingArrayStore.superclass.loadData.call(this, data,
				append);
	}
});
Ext.reg('pagingarraystore', Ext.ux.data.PagingArrayStore);
Ext.ux.data.PagingSimpleStore = Ext.ux.data.PagingArrayStore;
Ext.reg('pagingsimplestore', Ext.ux.data.PagingSimpleStore);
Ext.ux.data.PagingGroupingStore = Ext.extend(Ext.ux.data.PagingStore, Ext
		.copyTo({}, Ext.data.GroupingStore.prototype, [ 'constructor',
				'remoteGroup', 'groupOnSort', 'groupDir', 'clearGrouping',
				'groupBy', 'sort', 'applyGroupField', 'applyGrouping',
				'getGroupState' ]));
Ext.reg('paginggroupingstore', Ext.ux.data.PagingGroupingStore);
Ext.ux.PagingToolbar = Ext.extend(Ext.PagingToolbar, {
	onLoad : function(store, r, o) {
		if (!this.rendered) {
			this.dsLoaded = [ store, r, o ];
			return;
		}
		var p = this.getParams();
		this.cursor = (o.params && o.params[p.start]) ? o.params[p.start] : 0;
		this.onChange();
	},
	onChange : function() {
		var t = this.store.getTotalCount(), s = this.pageSize;
		if (this.cursor >= t) {
			this.cursor = Math.ceil((t + 1) / s) * s;
		}
		var d = this.getPageData(), ap = d.activePage, ps = d.pages;
		this.afterTextItem.setText(String.format(this.afterPageText, d.pages));
		this.inputItem.setValue(ap);
		this.first.setDisabled(ap == 1);
		this.prev.setDisabled(ap == 1);
		this.next.setDisabled(ap == ps);
		this.last.setDisabled(ap == ps);
		this.refresh.enable();
		this.updateInfo();
		this.fireEvent('change', this, d);
	},
	onClear : function() {
		this.cursor = 0;
		this.onChange();
	},
	doRefresh : function() {
		delete this.store.lastParams;
		this.doLoad(this.cursor);
	},
	bindStore : function(store, initial) {
		var doLoad;
		if (!initial && this.store) {
			if (store !== this.store && this.store.autoDestroy) {
				this.store.destroy();
			} else {
				this.store.un('beforeload', this.beforeLoad, this);
				this.store.un('load', this.onLoad, this);
				this.store.un('exception', this.onLoadError, this);
				this.store.un('datachanged', this.onChange, this);
				this.store.un('add', this.onChange, this);
				this.store.un('remove', this.onChange, this);
				this.store.un('clear', this.onClear, this);
			}
			if (!store) {
				this.store = null;
			}
		}
		if (store) {
			store = Ext.StoreMgr.lookup(store);
			store.on({
				scope : this,
				beforeload : this.beforeLoad,
				load : this.onLoad,
				exception : this.onLoadError,
				datachanged : this.onChange,
				add : this.onChange,
				remove : this.onChange,
				clear : this.onClear
			});
			doLoad = true;
		}
		this.store = store;
		if (doLoad) {
			this.onLoad(store, null, {});
		}
	}
});
Ext.reg('ux.paging', Ext.ux.PagingToolbar);
Ext.override(Ext.data.Store, {
	addField : function(field) {
		field = new Ext.data.Field(field);
		this.recordType.prototype.fields.replace(field);
		if (typeof field.defaultValue != 'undefined') {
			this.each(function(r) {
				if (typeof r.data[field.name] == 'undefined') {
					r.data[field.name] = field.defaultValue;
				}
			});
		}
		delete this.reader.ef;
		this.reader.buildExtractors();
	},
	removeField : function(name) {
		this.recordType.prototype.fields.removeKey(name);
		this.each(function(r) {
			delete r.data[name];
			if (r.modified) {
				delete r.modified[name];
			}
		});
		delete this.reader.ef;
		this.reader.buildExtractors();
	}
});
Ext.override(Ext.grid.ColumnModel, {
	addColumn : function(column, colIndex) {
		if (typeof column == 'string') {
			column = {
				header : column,
				dataIndex : column
			};
		}
		var config = this.config;
		this.config = [];
		if (typeof colIndex == 'number') {
			config.splice(colIndex, 0, column);
		} else {
			colIndex = config.push(column);
		}
		this.setConfig(config);
		return colIndex;
	},
	removeColumn : function(colIndex) {
		var config = this.config;
		this.config = [ config[colIndex] ];
		config.splice(colIndex, 1);
		this.setConfig(config);
	}
});
Ext.override(Ext.grid.GridPanel, {
	addColumn : function(field, column, colIndex) {
		if (!column) {
			if (field.dataIndex) {
				column = field;
				field = field.dataIndex;
			} else {
				column = field.name || field;
			}
		}
		this.store.addField(field);
		return this.colModel.addColumn(column, colIndex);
	},
	removeColumn : function(name, colIndex) {
		this.store.removeField(name);
		if (typeof colIndex != 'number') {
			colIndex = this.colModel.findColumnIndex(name);
		}
		if (colIndex >= 0) {
			this.colModel.removeColumn(colIndex);
		}
	}
});