/*!
 * 业绩与奖金的计算
 * 
 */

/**给Ajax添加遮罩，硬编码*/
var myMask = new Ext.LoadMask(Ext.getBody(), {  
                    msg : "Please wait..."  
                });  

Ext.onReady(function(){
    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget = 'side';
    var fs = new Ext.FormPanel({
        frame: true,
        title:'业绩奖金计算',
        labelAlign: 'right',
        labelWidth: 85,
        width:340,
        waitMsgTarget: true,
        items: [
            new Ext.form.FieldSet({
                title: '#############<font color=red>请谨慎操作</font>######',
                autoHeight: true,
                items: {xtype:'datetimefield', 
                		format: 'Y-m-d', 
                		editable: true, 
                		fieldLabel: '计算时间',
                		name: 'endDate' ,
                		width:190,
                		id : 'ddate',
                		allowBlank:false}
            })
        ]
    });
    
    fs.addButton({
    	id : 'timmer',
    	text :"结束定时",
    	iconCls:"clock_stop"
    }, function(){
    	 	myMask.show();  
	        Ext.Ajax.request({
    			url : './../web/control.json',
    			success : function(response,options){
    				myMask.hide(); 
    				Home.param.close = !Home.param.close;
    				if(Home.param.close){
        				Ext.getCmp('timmer').setText("启动定时");
        				Ext.getCmp('timmer').setIcon("clock_play");
        				submit.enable();
        				Ext.getCmp('ddate').enable();
    				}else{
    					Ext.getCmp('timmer').setText("结束定时");
    					Ext.getCmp('timmer').setIcon("clock_stop");
    					submit.disable();
    					Ext.getCmp('ddate').disable();
    				}
    			},
    			failure : function(response,options){
    				myMask.hide(); 
    				Ext.MessageBox.alert('提示','操作出现错误，请反馈给开发人员');
    			},
    			params:{close:Home.param.close}
    			
    		});	 
    });
    
    fs.addButton({iconCls:'reset',text:'重新选择'}, function(){
        fs.getForm().reset();
    });
	
    var submit = fs.addButton({
        text: '开始计算',
        disabled : true,
        iconCls : "computer_go",
        handler: function(){
        	if(Ext.getCmp('ddate').getValue()==""){
        		Ext.MessageBox.alert('提示','计算时间没有填写');
        		return;
        	}
        	this.disable();
            fs.getForm().submit({
            		timeout : 1800000, //timeout=30 min
            		url: './../grade/calc.json',
                	waitMsg : '正在处理，请稍等...',
                    success: function(form, action) {
                    	Ext.MessageBox.alert("提示", action.result.message);
                    },
                    failure: function(form, action) {
						Ext.MessageBox.alert("警告", action.result.message);
						this.enable();
                    },
                    scope: this
                });
        }
    });
    fs.render('angel-calc');
    fs.on({
        actioncomplete: function(form, action){
            if(action.type == 'submit'){
                submit.enable();
            }
        }
    });
    
    
    /**获取定时状态，初始化被关闭的页面*/
    Ext.Ajax.request({
		url : './../web/getClockState.json',
		success : function(response,options){
			Home.param.close = Ext.decode(response.responseText);
			if(Home.param.close){
				Ext.getCmp('timmer').setText("启动定时");
				Ext.getCmp('timmer').setIcon("clock_play");
	    		submit.enable();
	    		Ext.getCmp('ddate').enable();
			}else{
				Ext.getCmp('timmer').setText("结束定时");
				Ext.getCmp('timmer').setIcon("clock_stop");
	    		submit.disable();
	    		Ext.getCmp('ddate').disable();
			}
		},
		failure : function(response,options){
			Ext.MessageBox.alert('提示','定时状态获取不到，请联系开发人员');
		}
	});	 
});