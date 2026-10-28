import type { MissionId, MissionInputs } from '../../src/lib/missions/model';
export const solved: Record<MissionId,MissionInputs> = {
  'paper-robot':{repeats:'4',direction:'west'},
  'rolling-lab':{heightA:'1',heightB:'1',conclusion:'surface'},
  'equal-halves':{cells:'0,2,4,6,8,10',halfEight:'4'},
  'glider-lab':{change:'wing',meanA:'4',meanB:'5',conclusion:'sample'},
  'risk-lab':{allocation:'50',lowest:'90',risk:'remains'},
  'heart-route':{first:'right',second:'lungs',third:'left',oxygen:'lungs'},
  'ocean-web':{first:'zoo',second:'small',third:'large',effect:'less-food'},
  'message-lab':{audience:'families',headline:'clear',rate:'15',claim:'sample'},
  'business-lab':{price:'5',profit:'2',fewer:'loss'},
  'language-lab':{question:'where',instruction:'left',thanks:'thank',map:'left'},
};
