import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from deploy_plan import unchanged_paths
class ReleaseDelta(unittest.TestCase):
 def test_only_identical_hashes_are_skipped(self):
  local=[{'path':'a','sha256':'a'*64},{'path':'b','sha256':'b'*64},{'path':'new','sha256':'c'*64}]
  remote={'format':1,'files':[{'path':'a','sha256':'a'*64},{'path':'b','sha256':'d'*64}]}
  self.assertEqual(unchanged_paths(local,remote),{'a'})
 def test_bad_manifests_stop(self):
  for name in ['/escape','../escape','valid']:
   with self.assertRaises(ValueError):unchanged_paths([],{'format':1,'files':[{'path':name,'sha256':'invalid'}]})
  with self.assertRaises(ValueError):unchanged_paths([],{'format':2,'files':[]})
if __name__=='__main__':unittest.main()
