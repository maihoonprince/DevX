
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronDown, ChevronUp, Award, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DSAQuestion {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  javaCode: string;
  pythonCode: string;
}

const questionsPerPage = 10;

const DSAQuestions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [solvedQuestions, setSolvedQuestions] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSolvedQuestions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('solved_questions')
          .select('question_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching solved questions:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your solved questions.",
            variant: "destructive",
          });
        } else if (data) {
          const questionIds = data.map(item => item.question_id);
          setSolvedQuestions(questionIds);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolvedQuestions();
  }, [user, toast]);

  const handleCheckboxClick = (questionId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your solved questions.",
        variant: "destructive",
      });
      return;
    }

    setCurrentQuestionId(questionId);
    setIsDialogOpen(true);
  };

  const handleConfirmSolved = async () => {
    if (!user || currentQuestionId === null) return;

    try {
      setIsLoading(true);
      
      if (!solvedQuestions.includes(currentQuestionId)) {
        const { error } = await supabase
          .from('solved_questions')
          .insert({ 
            user_id: user.id, 
            question_id: currentQuestionId,
            solved_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error marking question as solved:', error);
          toast({
            title: "Error",
            description: "Failed to mark question as solved.",
            variant: "destructive",
          });
        } else {
          setSolvedQuestions(prev => [...prev, currentQuestionId]);
          
          const newCount = solvedQuestions.length + 1;
          const newBadge = getBadgeForQuestionCount(newCount);
          
          if (profile && (newBadge !== profile.badge || profile.questions_solved !== newCount)) {
            await updateProfile({
              questions_solved: newCount,
              badge: newBadge
            });
          }
          
          toast({
            title: "Success!",
            description: `Question marked as solved. ${newBadge !== profile?.badge ? `You've earned the ${newBadge} badge!` : ''}`,
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDialogOpen(false);
      setCurrentQuestionId(null);
      setIsLoading(false);
    }
  };

  const handleCancelSolved = () => {
    setIsDialogOpen(false);
    setCurrentQuestionId(null);
  };

  const getBadgeForQuestionCount = (count: number): string => {
    if (count >= 100) return "Diamond";
    if (count >= 75) return "Gold";
    if (count >= 50) return "Silver";
    if (count >= 25) return "Bronze";
    return "Beginner";
  };

  const dsaQuestions: DSAQuestion[] = [
        {
            id: 1,
            title: "Two Sum",
            difficulty: "Easy",
            category: "Arrays",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            javaCode: `
// Time Complexity: O(n)
// Space Complexity: O(n)
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    // Iterate through the array
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        // Check if complement exists in map
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        
        // Add current number to map
        map.put(nums[i], i);
    }
    return new int[] {};
}`,
            pythonCode: `
# Time Complexity: O(n)
# Space Complexity: O(n)
def two_sum(nums: List[int], target: int) -> List[int]:
    num_map = {}  # value -> index
    
    # Enumerate through the list
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists
        if complement in num_map:
            return [num_map[complement], i]
            
        # Add current number to map
        num_map[num] = i
    
    return []`
        },
        {
            id: 2,
            title: "Valid Parentheses",
            difficulty: "Easy",
            category: "Stack",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            javaCode: `
// Time Complexity: O(n)
// Space Complexity: O(n)
public boolean isValid(String s) {
    // Use stack to keep track of opening brackets
    Stack<Character> stack = new Stack<>();
    
    // Map to store matching bracket pairs
    Map<Character, Character> brackets = new HashMap<>();
    brackets.put(')', '(');
    brackets.put('}', '{');
    brackets.put(']', '[');
    
    // Iterate through each character
    for (char c : s.toCharArray()) {
        // If it's a closing bracket
        if (brackets.containsKey(c)) {
            // Get matching opening bracket from top of stack
            char topElement = stack.empty() ? '#' : stack.pop();
            
            // Check if brackets match
            if (topElement != brackets.get(c)) {
                return false;
            }
        } else {
            // Push opening bracket to stack
            stack.push(c);
        }
    }
    
    // String is valid if stack is empty
    return stack.isEmpty();
}`,
            pythonCode: `
# Time Complexity: O(n)
# Space Complexity: O(n)
def is_valid(s: str) -> bool:
    # Initialize stack for keeping track of opening brackets
    stack = []
    
    # Dictionary to store bracket pairs
    brackets = {")": "(", "}": "{", "]": "["}
    
    # Iterate through each character
    for char in s:
        # If it's a closing bracket
        if char in brackets:
            # Pop the top element if stack is not empty, else assign dummy value
            top_element = stack.pop() if stack else '#'
            
            # Check if brackets match
            if brackets[char] != top_element:
                return False
        else:
            # Push opening bracket to stack
            stack.append(char)
    
    # String is valid if stack is empty
    return len(stack) == 0`
        },
        {
            id: 3,
            title: "Maximum Subarray",
            difficulty: "Medium",
            category: "Dynamic Programming",
            description: "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
            javaCode: `
// Time Complexity: O(n)
// Space Complexity: O(1)
public int maxSubArray(int[] nums) {
    // Initialize variables to track current and maximum sum
    int currentSum = nums[0];
    int maxSum = nums[0];
    
    // Start from second element
    for (int i = 1; i < nums.length; i++) {
        // Choose between starting new subarray or extending existing one
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        // Update maximum sum if current sum is larger
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`,
            pythonCode: `
# Time Complexity: O(n)
# Space Complexity: O(1)
def max_subarray(nums: List[int]) -> int:
    # Initialize current and maximum sum with first element
    current_sum = max_sum = nums[0]
    
    # Iterate through array starting from second element
    for num in nums[1:]:
        # Choose between starting new subarray or extending existing one
        current_sum = max(num, current_sum + num)
        # Update maximum sum if current sum is larger
        max_sum = max(max_sum, current_sum)
    
    return max_sum`
        },
        {
            id: 4,
            title: "Merge Two Sorted Lists",
            difficulty: "Easy",
            category: "Linked List",
            description: "Merge two sorted linked lists and return it as a sorted list.",
            javaCode: `
// Time Complexity: O(n + m)
// Space Complexity: O(1)
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    // Create dummy node to avoid edge cases
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    
    // Compare nodes from both lists
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }
    
    // Append remaining nodes
    current.next = l1 == null ? l2 : l1;
    
    return dummy.next;
}`,
            pythonCode: `
# Time Complexity: O(n + m)
# Space Complexity: O(1)
def merge_two_lists(l1: ListNode, l2: ListNode) -> ListNode:
    # Create dummy node to avoid edge cases
    dummy = ListNode(0)
    current = dummy
    
    # Compare nodes from both lists
    while l1 and l2:
        if l1.val <= l2.val:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next
    
    # Append remaining nodes
    current.next = l1 if l1 else l2
    
    return dummy.next`
        },
        {
            id: 5,
            title: "Reverse Linked List",
            difficulty: "Easy",
            category: "Linked List",
            description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            javaCode: `
// Time Complexity: O(n)
// Space Complexity: O(1)
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode current = head;
    
    // Iterate through list
    while (current != null) {
        // Store next node
        ListNode next = current.next;
        // Reverse pointer
        current.next = prev;
        // Move prev and current one step forward
        prev = current;
        current = next;
    }
    
    return prev;
}`,
            pythonCode: `
# Time Complexity: O(n)
// Space Complexity: O(1)
def reverse_list(head: ListNode) -> ListNode:
    prev = None
    current = head
    
    # Iterate through list
    while current:
        # Store next node
        next_node = current.next
        # Reverse pointer
        current.next = prev
        # Move prev and current one step forward
        prev = current
        current = next_node
    
    return prev`
        },
    {
        id: 6,
        title: "Climbing Stairs",
        difficulty: "Easy",
        category: "Dynamic Programming",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        javaCode: `
public int climbStairs(int n) {
    if (n <= 2) return n;
    
    int[] dp = new int[n + 1];
    dp[1] = 1;
    dp[2] = 2;
    
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}`,
        pythonCode: `
def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
        
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
        
    return dp[n]`
    },
    {
        id: 7,
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        category: "Arrays",
        description: "Given an array prices where prices[i] is the price of a given stock on the ith day, find the maximum profit you can achieve.",
        javaCode: `
public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE;
    int maxProfit = 0;
    
    for (int price : prices) {
        minPrice = Math.min(minPrice, price);
        maxProfit = Math.max(maxProfit, price - minPrice);
    }
    
    return maxProfit;
}`,
        pythonCode: `
def max_profit(prices: List[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
        
    return max_profit`
    },
    {
        id: 8,
        title: "Symmetric Tree",
        difficulty: "Easy",
        category: "Binary Trees",
        description: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
        javaCode: `
public boolean isSymmetric(TreeNode root) {
    if (root == null) return true;
    return isMirror(root.left, root.right);
}

private boolean isMirror(TreeNode left, TreeNode right) {
    if (left == null && right == null) return true;
    if (left == null  right == null) return false;
    
    return (left.val == right.val)
        && isMirror(left.left, right.right)
        && isMirror(left.right, right.left);
}`,
        pythonCode: `
def is_symmetric(root: TreeNode) -> bool:
    def is_mirror(left: TreeNode, right: TreeNode) -> bool:
        if not left and not right:
            return True
        if not left or not right:
            return False
            
        return (left.val == right.val
            and is_mirror(left.left, right.right)
            and is_mirror(left.right, right.left))
            
    if not root:
        return True
    return is_mirror(root.left, root.right)`
    },
    {
        id: 9,
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        category: "Binary Trees",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
        javaCode: `
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> currentLevel = new ArrayList<>();
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            currentLevel.add(node.val);
            
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        
        result.add(currentLevel);
    }
    
    return result;
}`,
        pythonCode: `
def level_order(root: TreeNode) -> List[List[int]]:
    if not root:
        return []
        
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        current_level = []
        
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
                
        result.append(current_level)
        
    return result`
    },
    {
        id: 10,
        title: "Merge k Sorted Lists",
        difficulty: "Hard",
        category: "Linked Lists",
        description: "Given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        javaCode: `
public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null  lists.length == 0) return null;
    
    PriorityQueue<ListNode> queue = new PriorityQueue<>((a, b) -> a.val - b.val);
    
    // Add first node of each list to the queue
    for (ListNode list : lists) {
        if (list != null) {
            queue.offer(list);
        }
    }
    
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    
    while (!queue.isEmpty()) {
        tail.next = queue.poll();
        tail = tail.next;
        
        if (tail.next != null) {
            queue.offer(tail.next);
        }
    }
    
    return dummy.next;
}`,
        pythonCode: `
def merge_k_lists(lists: List[ListNode]) -> ListNode:
    if not lists:
        return None
        
    # Create heap
    heap = []
    
    # Add first node of each list to heap
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst.val, i, lst))
            
    dummy = ListNode(0)
    curr = dummy
    
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
            
    return dummy.next`
    },
    {
        id: 11,
        title: "LRU Cache",
        difficulty: "Medium",
        category: "Design",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
        javaCode: `
class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }
    
    private Map<Integer, Node> cache;
    private Node head, tail;
    private int capacity, size;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new HashMap<>();
        this.head = new Node(0, 0);
        this.tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }
    
    public int get(int key) {
        if (cache.containsKey(key)) {
            Node node = cache.get(key);
            moveToHead(node);
            return node.value;
        }
        return -1;
    }
    
    public void put(int key, int value) {
        if (cache.containsKey(key)) {
            Node node = cache.get(key);
            node.value = value;
            moveToHead(node);
        } else {
            Node newNode = new Node(key, value);
            cache.put(key, newNode);
            addNode(newNode);
            size++;
            
            if (size > capacity) {
                Node tail = removeTail();
                cache.remove(tail.key);
                size--;
            }
        }
    }
    
    private void addNode(Node node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }
    
    private void removeNode(Node node) {
        Node prev = node.prev;
        Node next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    
    private void moveToHead(Node node) {
        removeNode(node);
        addNode(node);
    }
    
    private Node removeTail() {
        Node res = tail.prev;
        removeNode(res);
        return res;
    }
}`,
        pythonCode: `
class LRUCache:
    def init(self, capacity: int):
        self.cache = {}
        self.capacity = capacity
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head
        
    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._move_to_head(node)
            return node.value
        return -1
        
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
        else:
            new_node = Node(key, value)
            self.cache[key] = new_node
            self._add_node(new_node)
            
            if len(self.cache) > self.capacity:
                lru = self._pop_tail()
                del self.cache[lru.key]
                
    def _add_node(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node
        
    def _remove_node(self, node):
        prev = node.prev
        new = node.next
        prev.next = new
        new.prev = prev
        
    def _move_to_head(self, node):
        self._remove_node(node)
        self._add_node(node)
        
    def _pop_tail(self):
        res = self.tail.prev
        self._remove_node(res)
        return res`
    },

    {
        id: 12,
        title: "Number of Islands",
        difficulty: "Medium",
        category: "Graphs",
        description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        javaCode: `
public int numIslands(char[][] grid) {
    if (grid == null  grid.length == 0) return 0;
    
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                count++;
                dfs(grid, i, j);
            }
        }
    }
    return count;
}

private void dfs(char[][] grid, int i, int j) {
    if (i < 0  j < 0  i >= grid.length  j >= grid[0].length  grid[i][j] != '1') return;
    
    grid[i][j] = '0';
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}`,
        pythonCode: `
def numIslands(self, grid: List[List[str]]) -> int:
    if not grid:
        return 0
        
    count = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                self.dfs(grid, i, j)
                count += 1
    return count
    
def dfs(self, grid, i, j):
    if i<0 or j<0 or i>=len(grid) or j>=len(grid[0]) or grid[i][j] != '1':
        return
    
    grid[i][j] = '0'
    self.dfs(grid, i+1, j)
    self.dfs(grid, i-1, j)
    self.dfs(grid, i, j+1)
    self.dfs(grid, i, j-1)`
    },
    {
        id: 13,
        title: "Rotate Image",
        difficulty: "Medium",
        category: "Arrays",
        description: "You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees (clockwise).",
        javaCode: `
public void rotate(int[][] matrix) {
    int n = matrix.length;
    
    // transpose matrix
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
    
    // reverse each row
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n/2; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[i][n-1-j];
            matrix[i][n-1-j] = temp;
        }
    }
}`,
        pythonCode: `
def rotate(self, matrix: List[List[int]]) -> None:
    n = len(matrix)
    
    # transpose matrix
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    
    # reverse each row
    for i in range(n):
        matrix[i].reverse()`
    },
    {
        id: 14,
        title: "Course Schedule",
        difficulty: "Medium",
        category: "Graphs",
        description: "There are a total of numCourses courses you have to take. Some courses may have prerequisites. Return true if you can finish all courses.",
        javaCode: `
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) {
        adj.add(new ArrayList<>());
    }
    
    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
    }
    
    int[] visited = new int[numCourses];
    
    for (int i = 0; i < numCourses; i++) {
        if (visited[i] == 0 && !dfs(adj, visited, i)) {
            return false;
        }
    }
    return true;
}

private boolean dfs(List<List<Integer>> adj, int[] visited, int v) {
    if (visited[v] == 1) return false;
    if (visited[v] == 2) return true;
    
    visited[v] = 1;
    for (int next : adj.get(v)) {
        if (!dfs(adj, visited, next)) {
            return false;
        }
    }
    visited[v] = 2;
    return true;
}`,
        pythonCode: `
def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
    adj = [[] for _ in range(numCourses)]
    for course, pre in prerequisites:
        adj[pre].append(course)
    
    visited = [0] * numCourses
    
    def dfs(v):
        if visited[v] == 1: return False
        if visited[v] == 2: return True
        
        visited[v] = 1
        for next_course in adj[v]:
            if not dfs(next_course):
                return False
        visited[v] = 2
        return True
    
    for i in range(numCourses):
        if visited[i] == 0 and not dfs(i):
            return False
    return True`
    },
    {
        id: 15,
        title: "Word Break",
        difficulty: "Medium",
        category: "Dynamic Programming",
        description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
        javaCode: `
public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> dict = new HashSet<>(wordDict);
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    
    for (int i = 1; i <= s.length(); i++) {
        for (int j = 0; j < i; j++) {
            if (dp[j] && dict.contains(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length()];
}`,
        pythonCode: `
def wordBreak(self, s: str, wordDict: List[str]) -> bool:
    word_set = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    
    return dp[len(s)]`
    },

    {
        id: 16,
        title: "Minimum Window Substring",
        difficulty: "Hard",
        category: "Strings",
        description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
        javaCode: `
public String minWindow(String s, String t) {
    if (s.length() == 0  t.length() == 0) return "";
    
    Map<Character, Integer> dictT = new HashMap<>();
    for (char c : t.toCharArray()) {
        dictT.put(c, dictT.getOrDefault(c, 0) + 1);
    }
    
    int required = dictT.size();
    int l = 0, r = 0;
    int formed = 0;
    
    Map<Character, Integer> windowCounts = new HashMap<>();
    int[] ans = {-1, 0, 0}; // length, left, right
    
    while (r < s.length()) {
        char c = s.charAt(r);
        windowCounts.put(c, windowCounts.getOrDefault(c, 0) + 1);
        
        if (dictT.containsKey(c) && windowCounts.get(c).intValue() == dictT.get(c).intValue()) {
            formed++;
        }
        
        while (l <= r && formed == required) {
            c = s.charAt(l);
            
            if (ans[0] == -1  r - l + 1 < ans[0]) {
                ans[0] = r - l + 1;
                ans[1] = l;
                ans[2] = r;
            }
            
            windowCounts.put(c, windowCounts.get(c) - 1);
            if (dictT.containsKey(c) && windowCounts.get(c).intValue() < dictT.get(c).intValue()) {
                formed--;
            }
            
            l++;
        }
        
        r++;
    }
    
    return ans[0] == -1 ? "" : s.substring(ans[1], ans[2] + 1);
}`,
        pythonCode: `
def minWindow(self, s: str, t: str) -> str:
    if not t or not s:
        return ""
    
    dict_t = Counter(t)
    required = len(dict_t)
    
    # Filter all the characters from s into a new list along with their index
    filtered_s = [(i, char) for i, char in enumerate(s) if char in dict_t]
    
    l, r = 0, 0
    formed = 0
    window_counts = {}
    
    ans = float("inf"), None, None
    
    while r < len(filtered_s):
        character = filtered_s[r][1]
        window_counts[character] = window_counts.get(character, 0) + 1
        
        if window_counts[character] == dict_t[character]:
            formed += 1
        
        while l <= r and formed == required:
            character = filtered_s[l][1]
            
            # Save smallest window until now
            end = filtered_s[r][0]
            start = filtered_s[l][0]
            if end - start + 1 < ans[0]:
                ans = (end - start + 1, start, end)
            
            window_counts[character] -= 1
            if window_counts[character] < dict_t[character]:
                formed -= 1
            l += 1    
        
        r += 1    
    return "" if ans[0] == float("inf") else s[ans[1]: ans[2] + 1]`
    },

    {
        id: 17,
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        category: "Dynamic Programming",
        description: "Given a string s, return the longest palindromic substring in s.",
        javaCode: `
    public String longestPalindrome(String s) {
        int n = s.length();
        boolean[][] dp = new boolean[n][n];
        String res = "";
        for (int l = 0; l < n; l++) {
            for (int i = 0; i + l < n; i++) {
                int j = i + l;
                if (s.charAt(i) == s.charAt(j) && (l < 2  dp[i+1][j-1])) {
                    dp[i][j] = true;
                    if (l + 1 > res.length()) {
                        res = s.substring(i, j + 1);
                    }
                }
            }
        }
        return res;
    }
    `,
        pythonCode: `
    def longestPalindrome(s: str) -> str:
        n = len(s)
        dp = [[False]*n for _ in range(n)]
        res = ""
        for l in range(n):
            for i in range(n - l):
                j = i + l
                if s[i] == s[j] and (l < 2 or dp[i+1][j-1]):
                    dp[i][j] = True
                    if l + 1 > len(res):
                        res = s[i:j+1]
        return res
    `
    },

    {
        id: 18,
        title: "Valid Parentheses",
        difficulty: "Easy",
        category: "Stack",
        description: "Given a string containing only brackets, determine if the input string is valid.",
        javaCode: `
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty()  stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }`,
        pythonCode: `
    def isValid(s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`
    },

    {
        id: 19,
        title: "Merge Intervals",
        difficulty: "Medium",
        category: "Sorting",
        description: "Given an array of intervals, merge all overlapping intervals.",
        javaCode: `
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] current = intervals[0];
        for (int[] interval : intervals) {
            if (interval[0] <= current[1]) {
                current[1] = Math.max(current[1], interval[1]);
            } else {
                result.add(current);
                current = interval;
            }
        }
        result.add(current);
        return result.toArray(new int[result.size()][]);
    }`,
        pythonCode: `
    def merge(intervals):
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
        return merged`
    },

    {
        id: 20,
        title: "Two Sum",
        difficulty: "Easy",
        category: "Hashing",
        description: "Given an array and a target, return indices of two numbers such that they add up to the target.",
        javaCode: `
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }`,
        pythonCode: `
    def twoSum(nums, target):
        hashmap = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in hashmap:
                return [hashmap[diff], i]
            hashmap[num] = i`
    },

    {
        id: 21,
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        category: "Greedy",
        description: "Find the maximum profit by choosing a single day to buy one stock and choosing a different day to sell.",
        javaCode: `
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) minPrice = price;
            else maxProfit = Math.max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }`,
        pythonCode: `
    def maxProfit(prices):
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            min_price = min(min_price, price)
            max_profit = max(max_profit, price - min_price)
        return max_profit`
    },

    {
        id: 22,
        title: "Climbing Stairs",
        difficulty: "Easy",
        category: "Dynamic Programming",
        description: "You are climbing stairs. Each time you can either take 1 or 2 steps. In how many distinct ways can you climb to the top?",
        javaCode: `
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }`,
        pythonCode: `
    def climbStairs(n):
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b`
    },

    {
        id: 23,
        title: "Set Matrix Zeroes",
        difficulty: "Medium",
        category: "Matrix",
        description: "Given an m x n matrix, if an element is 0, set its entire row and column to 0.",
        javaCode: `
    public void setZeroes(int[][] matrix) {
        boolean[] row = new boolean[matrix.length];
        boolean[] col = new boolean[matrix[0].length];
        
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] == 0) {
                    row[i] = true;
                    col[j] = true;
                }
            }
        }
        
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                if (row[i]  col[j]) {
                    matrix[i][j] = 0;
                }
            }
        }
    }`,
        pythonCode: `
    def setZeroes(matrix):
        rows, cols = len(matrix), len(matrix[0])
        row_zero = set()
        col_zero = set()
        
        for i in range(rows):
            for j in range(cols):
                if matrix[i][j] == 0:
                    row_zero.add(i)
                    col_zero.add(j)
        
        for i in range(rows):
            for j in range(cols):
                if i in row_zero or j in col_zero:
                    matrix[i][j] = 0`
    },

    {
        id: 24,
        title: "Group Anagrams",
        difficulty: "Medium",
        category: "Hashing",
        description: "Given an array of strings, group the anagrams together.",
        javaCode: `
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String str : strs) {
            char[] chars = str.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
        }
        return new ArrayList<>(map.values());
    }`,
        pythonCode: `
    def groupAnagrams(strs):
        hashmap = {}
        for s in strs:
            key = ''.join(sorted(s))
            if key not in hashmap:
                hashmap[key] = []
            hashmap[key].append(s)
        return list(hashmap.values())`
    },

    {
        id: 25,
        title: "Missing Number",
        difficulty: "Easy",
        category: "Math",
        description: "Given an array containing n distinct numbers from 0 to n, find the one that is missing.",
        javaCode: `
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int total = n * (n + 1) / 2;
        int sum = 0;
        for (int num : nums) sum += num;
        return total - sum;
    }`,
        pythonCode: `
    def missingNumber(nums):
        n = len(nums)
        return n * (n + 1) // 2 - sum(nums)`
    },

    {
        id: 26,
        title: "Majority Element",
        difficulty: "Easy",
        category: "Array",
        description: "Given an array of size n, find the majority element that appears more than n/2 times.",
        javaCode: `
    public int majorityElement(int[] nums) {
        int count = 0, candidate = 0;
        for (int num : nums) {
            if (count == 0) candidate = num;
            count += (num == candidate) ? 1 : -1;
        }
        return candidate;
    }`,
        pythonCode: `
    def majorityElement(nums):
        count = 0
        candidate = None
        for num in nums:
            if count == 0:
                candidate = num
            count += 1 if num == candidate else -1
        return candidate`
    },

    {
        id: 27,
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        category: "Binary Search",
        description: "Search a given target in a rotated sorted array.",
        javaCode: `
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid])
                    right = mid - 1;
                else
                    left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right])
                    left = mid + 1;
                else
                    right = mid - 1;
            }
        }
        return -1;
    }`,
        pythonCode: `
    def search(nums, target):
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1`
    },

    {
        id: 28,
        title: "Sort Colors",
        difficulty: "Medium",
        category: "Two Pointers",
        description: "Sort an array with values 0, 1, 2 representing colors using constant space.",
        javaCode: `
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            switch (nums[mid]) {
                case 0:
                    int temp0 = nums[low];
                    nums[low++] = nums[mid];
                    nums[mid++] = temp0;
                    break;
                case 1:
                    mid++;
                    break;
                case 2:
                    int temp2 = nums[mid];
                    nums[mid] = nums[high];
                    nums[high--] = temp2;
                    break;
            }
        }
    }`,
        pythonCode: `
    def sortColors(nums):
        low, mid, high = 0, 0, len(nums) - 1
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1`
    },

    {
        id: 29,
        title: "Linked List Cycle",
        difficulty: "Easy",
        category: "Linked List",
        description: "Check if a linked list has a cycle using two pointers.",
        javaCode: `
    public boolean hasCycle(ListNode head) {
        if (head == null  head.next == null) return false;
        ListNode slow = head, fast = head.next;
        while (slow != fast) {
            if (fast == null  fast.next == null) return false;
            slow = slow.next;
            fast = fast.next.next;
        }
        return true;
    }`,
                            pythonCode: `
    def hasCycle(head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False`
},

{
    id: 30,
        title: "Palindrome Linked List",
            difficulty: "Easy",
                category: "Linked List",
                    description: "Check if a singly linked list is a palindrome.",
                        javaCode: `
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
    
        ListNode prev = null;
        while (slow != null) {
            ListNode next = slow.next;
            slow.next = prev;
            prev = slow;
            slow = next;
        }
    
        while (prev != null) {
            if (head.val != prev.val) return false;
            head = head.next;
            prev = prev.next;
        }
    
        return true;
    }`,
                            pythonCode: `
    def isPalindrome(head):
        slow, fast = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
    
        prev = None
        while slow:
            next_node = slow.next
            slow.next = prev
            prev = slow
            slow = next_node
    
        while prev:
            if head.val != prev.val:
                return False
            head = head.next
            prev = prev.next
        return True`
},

{
    id: 31,
        title: "Detect Cycle in a Directed Graph",
            difficulty: "Medium",
                category: "Graph",
                    description: "Given a directed graph, check whether the graph contains a cycle or not.",
                        javaCode: `
    public boolean isCyclic(int V, List<List<Integer>> adj) {
        boolean[] visited = new boolean[V];
        boolean[] recStack = new boolean[V];
    
        for (int i = 0; i < V; i++) {
            if (isCyclicUtil(i, visited, recStack, adj)) return true;
        }
        return false;
    }
    
    private boolean isCyclicUtil(int v, boolean[] visited, boolean[] recStack, List<List<Integer>> adj) {
        if (recStack[v]) return true;
        if (visited[v]) return false;
    
        visited[v] = true;
        recStack[v] = true;
        for (int neighbor : adj.get(v)) {
            if (isCyclicUtil(neighbor, visited, recStack, adj)) return true;
        }
        recStack[v] = false;
        return false;
    }`,
                            pythonCode: `
    def isCyclic(V, adj):
        visited = [False] * V
        recStack = [False] * V
    
        def dfs(v):
            visited[v] = True
            recStack[v] = True
            for neighbor in adj[v]:
                if not visited[neighbor]:
                    if dfs(neighbor):
                        return True
                elif recStack[neighbor]:
                    return True
            recStack[v] = False
            return False
    
        for node in range(V):
            if not visited[node]:
                if dfs(node):
                    return True
        return False`
},

{
    id: 32,
        title: "Kth Largest Element in an Array",
            difficulty: "Medium",
                category: "Heap",
                    description: "Find the kth largest element in an unsorted array.",
                        javaCode: `
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int num : nums) {
            minHeap.add(num);
            if (minHeap.size() > k) minHeap.poll();
        }
        return minHeap.peek();
    }`,
                            pythonCode: `
    import heapq
    def findKthLargest(nums, k):
        return heapq.nlargest(k, nums)[-1]`
},

{
    id: 33,
        title: "Course Schedule",
            difficulty: "Medium",
                category: "Graph",
                    description: "There are a total of numCourses you have to take, labeled from 0 to numCourses - 1. Determine if it is possible to finish all courses.",
                        javaCode: `
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        for (int[] pre : prerequisites) graph.get(pre[1]).add(pre[0]);
    
        int[] visited = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (!dfs(i, graph, visited)) return false;
        }
        return true;
    }
    
    private boolean dfs(int course, List<List<Integer>> graph, int[] visited) {
        if (visited[course] == 1) return false;
        if (visited[course] == 2) return true;
    
        visited[course] = 1;
        for (int next : graph.get(course)) {
            if (!dfs(next, graph, visited)) return false;
        }
        visited[course] = 2;
        return true;
    }`,
                            pythonCode: `
    def canFinish(numCourses, prerequisites):
        graph = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            graph[b].append(a)
    
        visited = [0] * numCourses
    
        def dfs(course):
            if visited[course] == 1:
                return False
            if visited[course] == 2:
                return True
    
            visited[course] = 1
            for neighbor in graph[course]:
                if not dfs(neighbor):
                    return False
            visited[course] = 2
            return True
    
        return all(dfs(i) for i in range(numCourses))`
},

{
    id: 34,
        title: "Combination Sum",
            difficulty: "Medium",
                category: "Backtracking",
                    description: "Return all unique combinations that sum to a target using unlimited instances of elements.",
                        javaCode: `
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] candidates, int target, int start, List<Integer> comb, List<List<Integer>> result) {
        if (target == 0) {
            result.add(new ArrayList<>(comb));
            return;
        }
        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] <= target) {
                comb.add(candidates[i]);
                backtrack(candidates, target - candidates[i], i, comb, result);
                comb.remove(comb.size() - 1);
            }
        }
    }`,
                            pythonCode: `
    def combinationSum(candidates, target):
        result = []
    
        def backtrack(remain, comb, start):
            if remain == 0:
                result.append(list(comb))
                return
            for i in range(start, len(candidates)):
                if candidates[i] <= remain:
                    comb.append(candidates[i])
                    backtrack(remain - candidates[i], comb, i)
                    comb.pop()
    
        backtrack(target, [], 0)
        return result`
},

{
    id: 35,
        title: "Permutations",
            difficulty: "Medium",
                category: "Backtracking",
                    description: "Return all possible permutations of a list of numbers.",
                        javaCode: `
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] nums, List<Integer> tempList, List<List<Integer>> result) {
        if (tempList.size() == nums.length) {
            result.add(new ArrayList<>(tempList));
            return;
        }
        for (int num : nums) {
            if (tempList.contains(num)) continue;
            tempList.add(num);
            backtrack(nums, tempList, result);
            tempList.remove(tempList.size() - 1);
        }
    }`,
                            pythonCode: `
    def permute(nums):
        result = []
    
        def backtrack(path, used):
            if len(path) == len(nums):
                result.append(path[:])
                return
            for i in range(len(nums)):
                if used[i]:
                    continue
                used[i] = True
                path.append(nums[i])
                backtrack(path, used)
                path.pop()
                used[i] = False
    
        backtrack([], [False] * len(nums))
        return result`
},

{
    id: 36,
        title: "Rotate Image",
            difficulty: "Medium",
                category: "Matrix",
                    description: "Rotate an n x n 2D matrix by 90 degrees (clockwise) in-place.",
                        javaCode: `
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n / 2; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[i][n - 1 - j];
                matrix[i][n - 1 - j] = temp;
            }
        }
    }`,
                            pythonCode: `
    def rotate(matrix):
        n = len(matrix)
        for i in range(n):
            for j in range(i, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        for row in matrix:
            row.reverse()`
},

{
    id: 37,
        title: "Unique Paths",
            difficulty: "Medium",
                category: "Dynamic Programming",
                    description: "Find the number of unique paths in an m x n grid, moving only down or right.",
                        javaCode: `
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int i = 0; i < m; i++) dp[i][0] = 1;
        for (int j = 0; j < n; j++) dp[0][j] = 1;
    
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
    
        return dp[m - 1][n - 1];
    }`,
                            pythonCode: `
    def uniquePaths(m, n):
        dp = [[1]*n for _ in range(m)]
        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = dp[i-1][j] + dp[i][j-1]
        return dp[-1][-1]`
},

{
    id: 38,
        title: "Longest Common Subsequence",
            difficulty: "Medium",
                category: "Dynamic Programming",
                    description: "Find the length of the longest common subsequence of two strings.",
                        javaCode: `
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m+1][n+1];
    
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i-1) == text2.charAt(j-1)) {
                    dp[i][j] = dp[i-1][j-1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
                }
            }
        }
        return dp[m][n];
    }`,
                            pythonCode: `
    def longestCommonSubsequence(text1, text2):
        m, n = len(text1), len(text2)
        dp = [[0]*(n+1) for _ in range(m+1)]
    
        for i in range(m):
            for j in range(n):
                if text1[i] == text2[j]:
                    dp[i+1][j+1] = dp[i][j] + 1
                else:
                    dp[i+1][j+1] = max(dp[i][j+1], dp[i+1][j])
        return dp[m][n]`
},

{
    id: 39,
        title: "Climbing Stairs",
            difficulty: "Easy",
                category: "Dynamic Programming",
                    description: "You can climb 1 or 2 steps. Find how many distinct ways you can climb to the top.",
                        javaCode: `
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }`,
                            pythonCode: `
    def climbStairs(n):
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n+1):
            a, b = b, a + b
        return b`
},

{
    id: 40,
        title: "Coin Change",
            difficulty: "Medium",
                category: "Dynamic Programming",
                    description: "Given coins of different denominations and a total amount, find the fewest number of coins needed.",
                        javaCode: `
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
    
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
    
        return dp[amount] > amount ? -1 : dp[amount];
    }`,
                            pythonCode: `
    def coinChange(coins, amount):
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for coin in coins:
                if coin <= i:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        return dp[amount] if dp[amount] <= amount else -1`
},

{
    id: 41,
        title: "Maximum Subarray",
            difficulty: "Easy",
                category: "Dynamic Programming",
                    description: "Find the contiguous subarray with the largest sum.",
                        javaCode: `
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0], maxEndingHere = nums[0];
        for (int i = 1; i < nums.length; i++) {
            maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
            maxSoFar = Math.max(maxSoFar, maxEndingHere);
        }
        return maxSoFar;
    }`,
                            pythonCode: `
    def maxSubArray(nums):
        max_so_far = nums[0]
        current_max = nums[0]
        for i in range(1, len(nums)):
            current_max = max(nums[i], current_max + nums[i])
            max_so_far = max(max_so_far, current_max)
        return max_so_far`
},

{
    id: 42,
        title: "Minimum Path Sum",
            difficulty: "Medium",
                category: "Dynamic Programming",
                    description: "Find a path from top-left to bottom-right of a grid with minimum sum.",
                        javaCode: `
    public int minPathSum(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        for (int i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
        for (int j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
    
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
            }
        }
        return grid[m-1][n-1];
    }`,
                            pythonCode: `
    def minPathSum(grid):
        m, n = len(grid), len(grid[0])
        for i in range(1, m):
            grid[i][0] += grid[i-1][0]
        for j in range(1, n):
            grid[0][j] += grid[0][j-1]
        for i in range(1, m):
            for j in range(1, n):
                grid[i][j] += min(grid[i-1][j], grid[i][j-1])
        return grid[-1][-1]`
},

{
    id: 43,
        title: "Longest Increasing Subsequence",
            difficulty: "Medium",
                category: "Dynamic Programming",
                    description: "Find the length of the longest increasing subsequence in an array.",
                        javaCode: `
    public int lengthOfLIS(int[] nums) {
        int[] dp = new int[nums.length];
        int len = 0;
        for (int num : nums) {
            int i = Arrays.binarySearch(dp, 0, len, num);
            if (i < 0) i = -(i + 1);
            dp[i] = num;
            if (i == len) len++;
        }
        return len;
    }`,
                            pythonCode: `
    import bisect
    def lengthOfLIS(nums):
        sub = []
        for x in nums:
            i = bisect.bisect_left(sub, x)
            if i == len(sub):
                sub.append(x)
            else:
                sub[i] = x
        return len(sub)`
},

{
    id: 44,
        title: "Validate Binary Search Tree",
            difficulty: "Medium",
                category: "Tree",
                    description: "Given a binary tree, check if it is a valid binary search tree (BST).",
                        javaCode: `
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    
    private boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min  node.val >= max) return false;
        return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    }`,
                            pythonCode: `
    def isValidBST(root):
        def validate(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return validate(node.left, low, node.val) and validate(node.right, node.val, high)
        return validate(root, float('-inf'), float('inf'))`
},

{
    id: 45,
        title: "Invert Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Invert a binary tree (mirror it).",
                        javaCode: `
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }`,
                            pythonCode: `
    def invertTree(root):
        if not root:
            return None
        root.left, root.right = invertTree(root.right), invertTree(root.left)
        return root`
},

{
    id: 46,
        title: "Symmetric Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Check whether a binary tree is symmetric around its center.",
                        javaCode: `
    public boolean isSymmetric(TreeNode root) {
        if (root == null) return true;
        return isMirror(root.left, root.right);
    }
    
    private boolean isMirror(TreeNode t1, TreeNode t2) {
        if (t1 == null && t2 == null) return true;
        if (t1 == null  t2 == null) return false;
        return (t1.val == t2.val)
            && isMirror(t1.left, t2.right)
            && isMirror(t1.right, t2.left);
    }`,
                            pythonCode: `
    def isSymmetric(root):
        def isMirror(t1, t2):
            if not t1 and not t2:
                return True
            if not t1 or not t2:
                return False
            return (t1.val == t2.val and
                    isMirror(t1.left, t2.right) and
                    isMirror(t1.right, t2.left))
        return isMirror(root, root)`
},

{
    id: 47,
        title: "Diameter of Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree.",
                        javaCode: `
    public int diameterOfBinaryTree(TreeNode root) {
        int[] diameter = new int[1];
        depth(root, diameter);
        return diameter[0];
    }
    
    private int depth(TreeNode node, int[] diameter) {
        if (node == null) return 0;
        int left = depth(node.left, diameter);
        int right = depth(node.right, diameter);
        diameter[0] = Math.max(diameter[0], left + right);
        return 1 + Math.max(left, right);
    }`,
                            pythonCode: `
    def diameterOfBinaryTree(root):
        diameter = [0]
        
        def depth(node):
            if not node:
                return 0
            left = depth(node.left)
            right = depth(node.right)
            diameter[0] = max(diameter[0], left + right)
            return 1 + max(left, right)
        
        depth(root)
        return diameter[0]`
},

{
    id: 48,
        title: "Maximum Depth of Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
                        javaCode: `
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }`,
                            pythonCode: `
    def maxDepth(root):
        if not root:
            return 0
        return 1 + max(maxDepth(root.left), maxDepth(root.right))`
},

{
    id: 49,
        title: "Balanced Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Determine if a binary tree is height-balanced. A height-balanced binary tree is defined as a binary tree in which the left and right subtrees of every node differ in height by no more than 1.",
                        javaCode: `
    public boolean isBalanced(TreeNode root) {
        return checkHeight(root) != -1;
    }
    
    private int checkHeight(TreeNode node) {
        if (node == null) return 0;
        int left = checkHeight(node.left);
        if (left == -1) return -1;
        int right = checkHeight(node.right);
        if (right == -1) return -1;
        if (Math.abs(left - right) > 1) return -1;
        return Math.max(left, right) + 1;
    }`,
                            pythonCode: `
    def isBalanced(root):
        def check(node):
            if not node:
                return 0
            left = check(node.left)
            if left == -1: return -1
            right = check(node.right)
            if right == -1: return -1
            if abs(left - right) > 1:
                return -1
            return max(left, right) + 1
        return check(root) != -1`
},

{
    id: 50,
        title: "Binary Tree Level Order Traversal",
            difficulty: "Medium",
                category: "Tree",
                    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (from left to right, level by level).",
                        javaCode: `
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }`,
                            pythonCode: `
    def levelOrder(root):
        if not root:
            return []
        queue = [root]
        res = []
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.pop(0)
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level)
        return res`
},

{
    id: 50,
        title: "Binary Tree Level Order Traversal",
            difficulty: "Medium",
                category: "Tree",
                    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (from left to right, level by level).",
                        javaCode: `
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }`,
                            pythonCode: `
    def levelOrder(root):
        if not root:
            return []
        queue = [root]
        res = []
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.pop(0)
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level)
        return res`
},

{
    id: 51,
        title: "Bellman-Ford Algorithm",
            difficulty: "Medium",
                category: "Graph",
                    description: "Find shortest paths from the source vertex to all vertices in a weighted graph with possible negative weights.",
                        javaCode: `
        public int[] bellmanFord(int vertices, int[][] edges, int source) {
            int[] dist = new int[vertices];
            Arrays.fill(dist, Integer.MAX_VALUE);
            dist[source] = 0;
    
            for (int i = 1; i < vertices; i++) {
                for (int[] edge : edges) {
                    int u = edge[0], v = edge[1], weight = edge[2];
                    if (dist[u] != Integer.MAX_VALUE && dist[u] + weight < dist[v]) {
                        dist[v] = dist[u] + weight;
                    }
                }
            }
    
            for (int[] edge : edges) {
                int u = edge[0], v = edge[1], weight = edge[2];
                if (dist[u] != Integer.MAX_VALUE && dist[u] + weight < dist[v]) {
                    throw new IllegalArgumentException("Graph contains a negative-weight cycle");
                }
            }
            
            return dist;
        }`,
                            pythonCode: `
        def bellman_ford(vertices, edges, source):
            dist = [float('inf')] * vertices
            dist[source] = 0
            
            for _ in range(vertices - 1):
                for u, v, weight in edges:
                    if dist[u] != float('inf') and dist[u] + weight < dist[v]:
                        dist[v] = dist[u] + weight
            
            for u, v, weight in edges:
                if dist[u] != float('inf') and dist[u] + weight < dist[v]:
                    raise ValueError("Graph contains a negative-weight cycle")
            
            return dist`
},

{
    id: 52,
        title: "Merge Two Sorted Lists",
            difficulty: "Easy",
                category: "Linked List",
                    description: "Merge two sorted linked lists and return it as a new list. The new list should be made by splicing together the nodes of the first two lists.",
                        javaCode: `
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
    
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
    
        current.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }`,
                            pythonCode: `
    def mergeTwoLists(l1, l2):
        dummy = ListNode()
        current = dummy
        while l1 and l2:
            if l1.val < l2.val:
                current.next = l1
                l1 = l1.next
            else:
                current.next = l2
                l2 = l2.next
            current = current.next
        current.next = l1 or l2
        return dummy.next`
},

{
    id: 53,
        title: "Linked List Cycle",
            difficulty: "Easy",
                category: "Linked List",
    description: "Given a linked list, determine if it has a cycle in it using Floyd's Cycle-Finding Algorithm.",
        javaCode: `
    public boolean hasCycle(ListNode head) {
        if (head == null  head.next == null) return false;
        ListNode slow = head, fast = head.next;
    
        while (slow != fast) {
            if (fast == null  fast.next == null) return false;
            slow = slow.next;
            fast = fast.next.next;
        }
        return true;
    }`,
            pythonCode: `
    def hasCycle(head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False`
},

{
    id: 54,
        title: "Reverse Linked List",
            difficulty: "Easy",
                category: "Linked List",
                    description: "Reverse a singly linked list.",
                        javaCode: `
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        while (head != null) {
            ListNode next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }`,
                            pythonCode: `
    def reverseList(head):
        prev = None
        while head:
            next_node = head.next
            head.next = prev
            prev = head
            head = next_node
        return prev`
},

{
    id: 55,
        title: "Palindrome Linked List",
            difficulty: "Easy",
                category: "Linked List",
                    description: "Check if a singly linked list is a palindrome.",
                        javaCode: `
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
    
        ListNode prev = null;
        while (slow != null) {
            ListNode next = slow.next;
            slow.next = prev;
            prev = slow;
            slow = next;
        }
    
        while (prev != null) {
            if (head.val != prev.val) return false;
            head = head.next;
            prev = prev.next;
        }
        return true;
    }`,
                            pythonCode: `
    def isPalindrome(head):
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
    
        prev = None
        while slow:
            next_node = slow.next
            slow.next = prev
            prev = slow
            slow = next_node
    
        while prev:
            if prev.val != head.val:
                return False
            head = head.next
            prev = prev.next
        return True`
},

{
    id: 56,
        title: "Remove Duplicates from Sorted List",
            difficulty: "Easy",
                category: "Linked List",
                    description: "Given the head of a sorted linked list, delete all duplicates such that each element appears only once.",
                        javaCode: `
    public ListNode deleteDuplicates(ListNode head) {
        ListNode current = head;
        while (current != null && current.next != null) {
            if (current.val == current.next.val) {
                current.next = current.next.next;
            } else {
                current = current.next;
            }
        }
        return head;
    }`,
                            pythonCode: `
    def deleteDuplicates(head):
        current = head
        while current and current.next:
            if current.val == current.next.val:
                current.next = current.next.next
            else:
                current = current.next
        return head`
},

{
    id: 57,
        title: "Intersection of Two Linked Lists",
            difficulty: "Easy",
                category: "Linked List",
                    description: "Given the heads of two singly linked lists, return the node at which the two lists intersect. If no intersection, return null.",
                        javaCode: `
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        ListNode a = headA, b = headB;
        while (a != b) {
            a = (a == null) ? headB : a.next;
            b = (b == null) ? headA : b.next;
        }
        return a;
    }`,
                            pythonCode: `
    def getIntersectionNode(headA, headB):
        a, b = headA, headB
        while a != b:
            a = headB if not a else a.next
            b = headA if not b else b.next
        return a`
},

{
    id: 58,
        title: "Add Two Numbers",
            difficulty: "Medium",
                category: "Linked List",
                    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.",
                        javaCode: `
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        int carry = 0;
        
        while (l1 != null  l2 != null  carry != 0) {
            int sum = carry;
            if (l1 != null) {
                sum += l1.val;
                l1 = l1.next;
            }
            if (l2 != null) {
                sum += l2.val;
                l2 = l2.next;
            }
            curr.next = new ListNode(sum % 10);
            carry = sum / 10;
            curr = curr.next;
        }
        return dummy.next;
    }`,
                            pythonCode: `
    def addTwoNumbers(l1, l2):
        dummy = ListNode()
        current = dummy
        carry = 0
        
        while l1 or l2 or carry:
            sum = carry
            if l1:
                sum += l1.val
                l1 = l1.next
            if l2:
                sum += l2.val
                l2 = l2.next
            carry = sum // 10
            current.next = ListNode(sum % 10)
            current = current.next
        
        return dummy.next`
},

{
    id: 59,
        title: "LRU Cache",
            difficulty: "Hard",
                category: "Design",
                    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement LRUCache with get and put operations.",
                        javaCode: `
    class LRUCache extends LinkedHashMap<Integer, Integer> {
        private int capacity;
    
        public LRUCache(int capacity) {
            super(capacity, 0.75f, true);
            this.capacity = capacity;
        }
    
        public int get(int key) {
            return super.getOrDefault(key, -1);
        }
    
        public void put(int key, int value) {
            super.put(key, value);
        }
    
        @Override
        protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
            return size() > capacity;
        }
    }`,
                            pythonCode: `
    from collections import OrderedDict
    
    class LRUCache:
        def init(self, capacity: int):
            self.cache = OrderedDict()
            self.capacity = capacity
    
        def get(self, key: int) -> int:
            if key not in self.cache:
                return -1
            self.cache.move_to_end(key)
            return self.cache[key]
    
        def put(self, key: int, value: int) -> None:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = value
            if len(self.cache) > self.capacity:
                self.cache.popitem(last=False)`
},

{
    id: 60,
        title: "Clone Graph",
            difficulty: "Medium",
                category: "Graph",
                    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
                        javaCode: `
    public Node cloneGraph(Node node) {
        if (node == null) return null;
        Map<Node, Node> map = new HashMap<>();
        return dfs(node, map);
    }
    
    private Node dfs(Node node, Map<Node, Node> map) {
        if (map.containsKey(node)) return map.get(node);
        Node copy = new Node(node.val);
        map.put(node, copy);
        for (Node neighbor : node.neighbors) {
            copy.neighbors.add(dfs(neighbor, map));
        }
        return copy;
    }`,
                            pythonCode: `
    def cloneGraph(node):
        if not node:
            return None
        visited = {}
    
        def dfs(n):
            if n in visited:
                return visited[n]
            copy = Node(n.val)
            visited[n] = copy
            for neighbor in n.neighbors:
                copy.neighbors.append(dfs(neighbor))
            return copy
    
        return dfs(node)`
},

{
    id: 61,
        title: "Course Schedule",
            difficulty: "Medium",
                category: "Graph",
                    description: "There are a total of numCourses you have to take. Some courses have prerequisites. Determine if you can finish all courses.",
                        javaCode: `
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        int[] indegree = new int[numCourses];
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        for (int[] pair : prerequisites) {
            graph.get(pair[1]).add(pair[0]);
            indegree[pair[0]]++;
        }
    
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++)
            if (indegree[i] == 0) queue.offer(i);
    
        int count = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            count++;
            for (int next : graph.get(course)) {
                if (--indegree[next] == 0)
                    queue.offer(next);
            }
        }
        return count == numCourses;
    }`,
                            pythonCode: `
    def canFinish(numCourses, prerequisites):
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for dest, src in prerequisites:
            graph[src].append(dest)
            indegree[dest] += 1
    
        queue = [i for i in range(numCourses) if indegree[i] == 0]
        count = 0
    
        while queue:
            course = queue.pop(0)
            count += 1
            for neighbor in graph[course]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    queue.append(neighbor)
    
        return count == numCourses`
},

{
    id: 62,
        title: "Pacific Atlantic Water Flow",
            difficulty: "Medium",
                category: "Graph",
                    description: "Given an m x n matrix of non-negative integers representing the height of each unit cell, find all cells that can flow to both the Pacific and Atlantic ocean.",
                        javaCode: `
    // Too long for full code — consider referencing Leetcode 417
    `,
                            pythonCode: `# Similar — typically uses DFS/BFS from borders`
},

{
    id: 63,
        title: "Number of Islands",
            difficulty: "Medium",
                category: "Graph",
                    description: "Given an m x n 2D grid map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands.",
                        javaCode: `
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    dfs(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }
    
    private void dfs(char[][] grid, int i, int j) {
        if (i < 0  j < 0  i >= grid.length  j >= grid[0].length  grid[i][j] != '1')
            return;
        grid[i][j] = '0';
        dfs(grid, i + 1, j);
        dfs(grid, i - 1, j);
        dfs(grid, i, j + 1);
        dfs(grid, i, j - 1);
    }`,
                            pythonCode: `
    def numIslands(grid):
        if not grid:
            return 0
        
        def dfs(r, c):
            if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] == '0':
                return
            grid[r][c] = '0'
            dfs(r+1, c)
            dfs(r-1, c)
            dfs(r, c+1)
            dfs(r, c-1)
    
        count = 0
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == '1':
                    dfs(r, c)
                    count += 1
        return count`
},

{
    id: 64,
        title: "Rotting Oranges",
            difficulty: "Medium",
                category: "Graph",
                    description: "Given a grid, each cell can be empty, a fresh orange, or a rotten orange. Every minute, any fresh orange adjacent to a rotten one becomes rotten. Return the minimum number of minutes until no fresh orange remains.",
                        javaCode: `
    // BFS approach required; too long for inline — use queue of coordinates
    `,
                            pythonCode: `# Similar: multi-source BFS using queue`
},

{
    id: 65,
        title: "Flood Fill",
            difficulty: "Easy",
                category: "Graph",
                    description: "An image is represented by an m x n integer grid. A value represents the color of the pixel. Implement the flood fill algorithm starting from a given pixel and replacing all connected pixels of the same color.",
                        javaCode: `
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        if (image[sr][sc] == color) return image;
        dfs(image, sr, sc, image[sr][sc], color);
        return image;
    }
    
    private void dfs(int[][] image, int r, int c, int oldColor, int newColor) {
        if (r < 0  c < 0  r >= image.length  c >= image[0].length  image[r][c] != oldColor) return;
        image[r][c] = newColor;
        dfs(image, r+1, c, oldColor, newColor);
        dfs(image, r-1, c, oldColor, newColor);
        dfs(image, r, c+1, oldColor, newColor);
        dfs(image, r, c-1, oldColor, newColor);
    }`,
                            pythonCode: `
    def floodFill(image, sr, sc, color):
        old_color = image[sr][sc]
        if old_color == color:
            return image
    
        def dfs(r, c):
            if r < 0 or c < 0 or r >= len(image) or c >= len(image[0]) or image[r][c] != old_color:
                return
            image[r][c] = color
            dfs(r+1, c)
            dfs(r-1, c)
            dfs(r, c+1)
            dfs(r, c-1)
    
        dfs(sr, sc)
        return image`
},

{
    id: 66,
        title: "Clone Linked List with Random Pointer",
            difficulty: "Medium",
                category: "Linked List",
                    description: "A linked list is given where each node contains an additional random pointer. Clone the list in O(N) time and space.",
                        javaCode: `
    // Solution uses hashmap or interleaving method — long to inline
    `,
                            pythonCode: `# Use hashmap or interleaving technique to clone with random pointers`
},

{
    id: 67,
        title: "Find Minimum in Rotated Sorted Array",
            difficulty: "Medium",
                category: "Binary Search",
                    description: "Given a rotated sorted array, find the minimum element. The array was originally sorted in ascending order but then rotated at some pivot.",
                        javaCode: `
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = (left + right) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }`,
                            pythonCode: `
    def findMin(nums):
        left, right = 0, len(nums) - 1
        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid
        return nums[left]`
},

{
    id: 68,
        title: "Search in Rotated Sorted Array",
            difficulty: "Medium",
                category: "Binary Search",
                    description: "Given a rotated sorted array and a target value, return its index if found. Otherwise, return -1.",
                        javaCode: `
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
    
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid])
                    right = mid - 1;
                else
                    left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right])
                    left = mid + 1;
                else
                    right = mid - 1;
            }
        }
        return -1;
    }`,
                            pythonCode: `
    def search(nums, target):
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1`
},

{
    id: 69,
        title: "Implement Trie (Prefix Tree)",
            difficulty: "Medium",
                category: "Trie",
                    description: "Implement a trie with insert, search, and startsWith methods to handle string storage and prefix searching.",
                        javaCode: `
    class Trie {
        class TrieNode {
            Map<Character, TrieNode> children = new HashMap<>();
            boolean isEnd = false;
        }
    
        private final TrieNode root = new TrieNode();
    
        public void insert(String word) {
            TrieNode node = root;
            for (char ch : word.toCharArray()) {
                node = node.children.computeIfAbsent(ch, c -> new TrieNode());
            }
            node.isEnd = true;
        }
    
        public boolean search(String word) {
            TrieNode node = root;
            for (char ch : word.toCharArray()) {
                node = node.children.get(ch);
                if (node == null) return false;
            }
            return node.isEnd;
        }
    
        public boolean startsWith(String prefix) {
            TrieNode node = root;
            for (char ch : prefix.toCharArray()) {
                node = node.children.get(ch);
                if (node == null) return false;
            }
            return true;
        }
    }`,
                            pythonCode: `
    class TrieNode:
        def init(self):
            self.children = {}
            self.is_end = False
    
    class Trie:
        def init(self):
            self.root = TrieNode()
    
        def insert(self, word):
            node = self.root
            for ch in word:
                node = node.children.setdefault(ch, TrieNode())
            node.is_end = True
    
        def search(self, word):
            node = self.root
            for ch in word:
                if ch not in node.children:
                    return False
                node = node.children[ch]
            return node.is_end
    
        def startsWith(self, prefix):
            node = self.root
            for ch in prefix:
                if ch not in node.children:
                    return False
                node = node.children[ch]
            return True`
},

{
    id: 70,
        title: "Implement Stack using Queues",
            difficulty: "Easy",
                category: "Stack",
                    description: "Implement a last-in-first-out (LIFO) stack using only two queues. You must implement push, pop, top, and empty operations.",
                        javaCode: `
    class MyStack {
        Queue<Integer> q = new LinkedList<>();
    
        public void push(int x) {
            q.add(x);
            for (int i = 0; i < q.size() - 1; i++)
                q.add(q.remove());
        }
    
        public int pop() {
            return q.remove();
        }
    
        public int top() {
            return q.peek();
        }
    
        public boolean empty() {
            return q.isEmpty();
        }
    }`,
                            pythonCode: `
    from collections import deque
    
    class MyStack:
        def init(self):
            self.q = deque()
    
        def push(self, x):
            self.q.append(x)
            for _ in range(len(self.q) - 1):
                self.q.append(self.q.popleft())
    
        def pop(self):
            return self.q.popleft()
    
        def top(self):
            return self.q[0]
    
        def empty(self):
            return not self.q`
},

{
    id: 71,
        title: "Daily Temperatures",
            difficulty: "Medium",
                category: "Stack",
                    description: "Given a list of daily temperatures, return a list such that each element tells you how many days you would have to wait until a warmer temperature.",
                        javaCode: `
    public int[] dailyTemperatures(int[] temps) {
        int[] res = new int[temps.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < temps.length; i++) {
            while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {
                int idx = stack.pop();
                res[idx] = i - idx;
            }
            stack.push(i);
        }
        return res;
    }`,
                            pythonCode: `
    def dailyTemperatures(T):
        res = [0] * len(T)
        stack = []
        for i, t in enumerate(T):
            while stack and T[i] > T[stack[-1]]:
                idx = stack.pop()
                res[idx] = i - idx
            stack.append(i)
        return res`
},

{
    id: 72,
        title: "Valid Parentheses",
            difficulty: "Easy",
                category: "Stack",
                    description: "Given a string containing only brackets, determine if the input string is valid. A valid string is open-closed correctly and in order.",
                        javaCode: `
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty()  stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }`,
                            pythonCode: `
    def isValid(s):
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`
},

{
    id: 73,
        title: "Evaluate Reverse Polish Notation",
            difficulty: "Medium",
                category: "Stack",
                    description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, /.",
                        javaCode: `
    public int evalRPN(String[] tokens) {
        Stack<Integer> stack = new Stack<>();
        for (String token : tokens) {
            if ("+-*/".contains(token)) {
                int b = stack.pop(), a = stack.pop();
                switch (token) {
                    case "+": stack.push(a + b); break;
                    case "-": stack.push(a - b); break;
                    case "*": stack.push(a * b); break;
                    case "/": stack.push(a / b); break;
                }
            } else {
                stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }`,
                            pythonCode: `
    def evalRPN(tokens):
        stack = []
        for token in tokens:
            if token in "+-*/":
                b, a = stack.pop(), stack.pop()
                if token == '+': stack.append(a + b)
                elif token == '-': stack.append(a - b)
                elif token == '*': stack.append(a * b)
                elif token == '/': stack.append(int(a / b))
            else:
                stack.append(int(token))
        return stack.pop()`
},

{
    id: 74,
        title: "Car Fleet",
            difficulty: "Medium",
                category: "Stack",
                    description: "There are n cars traveling to a destination. Each car has a position and speed. A car fleet is formed when cars arrive together. Return the number of car fleets.",
                        javaCode: `
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        double[][] cars = new double[n][2];
        for (int i = 0; i < n; i++) {
            cars[i][0] = position[i];
            cars[i][1] = (double)(target - position[i]) / speed[i];
        }
        Arrays.sort(cars, (a, b) -> Double.compare(b[0], a[0]));
        int fleets = 0;
        double time = 0;
        for (double[] car : cars) {
            if (car[1] > time) {
                time = car[1];
                fleets++;
            }
        }
        return fleets;
    }`,
                            pythonCode: `
    def carFleet(target, position, speed):
        pairs = sorted(zip(position, speed), reverse=True)
        stack = []
        for pos, spd in pairs:
            time = (target - pos) / spd
            if not stack or time > stack[-1]:
                stack.append(time)
        return len(stack)`
},

{
    id: 75,
        title: "Largest Rectangle in Histogram",
            difficulty: "Hard",
                category: "Stack",
                    description: "Given an array of heights representing histogram bars, find the area of the largest rectangle in the histogram.",
                        javaCode: `
    public int largestRectangleArea(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        int maxArea = 0;
        heights = Arrays.copyOf(heights, heights.length + 1);
        for (int i = 0; i < heights.length; i++) {
            while (!stack.isEmpty() && heights[i] < heights[stack.peek()]) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }`,
                            pythonCode: `
    def largestRectangleArea(heights):
        stack = []
        heights.append(0)
        max_area = 0
        for i, h in enumerate(heights):
            while stack and heights[stack[-1]] > h:
                height = heights[stack.pop()]
                width = i if not stack else i - stack[-1] - 1
                max_area = max(max_area, height * width)
            stack.append(i)
        return max_area`
},

{
    id: 76,
        title: "Min Stack",
            difficulty: "Easy",
                category: "Stack",
                    description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
                        javaCode: `
    class MinStack {
        private Stack<Integer> stack = new Stack<>();
        private Stack<Integer> minStack = new Stack<>();
    
        public void push(int val) {
            stack.push(val);
            if (minStack.isEmpty()  val <= minStack.peek()) {
                minStack.push(val);
            }
        }
    
        public void pop() {
            if (stack.pop().equals(minStack.peek())) {
                minStack.pop();
            }
        }
    
        public int top() {
            return stack.peek();
        }
    
        public int getMin() {
            return minStack.peek();
        }
    }`,
                            pythonCode: `
    class MinStack:
        def init(self):
            self.stack = []
            self.min_stack = []
    
        def push(self, val):
            self.stack.append(val)
            if not self.min_stack or val <= self.min_stack[-1]:
                self.min_stack.append(val)
    
        def pop(self):
            if self.stack.pop() == self.min_stack[-1]:
                self.min_stack.pop()
    
        def top(self):
            return self.stack[-1]
    
        def getMin(self):
            return self.min_stack[-1]`
},

{
    id: 77,
        title: "Binary Tree Inorder Traversal",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
                        javaCode: `
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        TreeNode curr = root;
        while (curr != null  !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }
            curr = stack.pop();
            res.add(curr.val);
            curr = curr.right;
        }
    
        return res;
    }`,
                            pythonCode: `
    def inorderTraversal(root):
        res, stack = [], []
        curr = root
        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.left
            curr = stack.pop()
            res.append(curr.val)
            curr = curr.right
        return res`
},

{
    id: 78,
        title: "Binary Tree Preorder Traversal",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given the root of a binary tree, return the preorder traversal of its nodes' values.",
                        javaCode: `
    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        if (root != null) stack.push(root);
    
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            res.add(node.val);
            if (node.right != null) stack.push(node.right);
            if (node.left != null) stack.push(node.left);
        }
    
        return res;
    }`,
                            pythonCode: `
    def preorderTraversal(root):
        if not root:
            return []
        stack, res = [root], []
        while stack:
            node = stack.pop()
            res.append(node.val)
            if node.right:
                stack.append(node.right)
            if node.left:
                stack.append(node.left)
        return res`
},

{
    id: 79,
        title: "Binary Tree Postorder Traversal",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given the root of a binary tree, return the postorder traversal of its nodes' values.",
                        javaCode: `
    public List<Integer> postorderTraversal(TreeNode root) {
        LinkedList<Integer> res = new LinkedList<>();
        Stack<TreeNode> stack = new Stack<>();
        if (root != null) stack.push(root);
    
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            res.addFirst(node.val);
            if (node.left != null) stack.push(node.left);
            if (node.right != null) stack.push(node.right);
        }
    
        return res;
    }`,
                            pythonCode: `
    def postorderTraversal(root):
        if not root:
            return []
        stack, res = [root], []
        while stack:
            node = stack.pop()
            res.append(node.val)
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        return res[::-1]`
},

{
    id: 80,
        title: "Invert Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Invert a binary tree by swapping the left and right children of every node.",
                        javaCode: `
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }`,
                            pythonCode: `
    def invertTree(root):
        if not root:
            return None
        root.left, root.right = invertTree(root.right), invertTree(root.left)
        return root`
},

{
    id: 81,
        title: "Symmetric Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Check whether a binary tree is symmetric around its center.",
                        javaCode: `
    public boolean isSymmetric(TreeNode root) {
        return root == null  isMirror(root.left, root.right);
    }
    
    private boolean isMirror(TreeNode t1, TreeNode t2) {
        if (t1 == null && t2 == null) return true;
        if (t1 == null  t2 == null) return false;
        return (t1.val == t2.val)
            && isMirror(t1.left, t2.right)
            && isMirror(t1.right, t2.left);
    }`,
                            pythonCode: `
    def isSymmetric(root):
        def isMirror(t1, t2):
            if not t1 and not t2: return True
            if not t1 or not t2: return False
            return t1.val == t2.val and isMirror(t1.left, t2.right) and isMirror(t1.right, t2.left)
        return isMirror(root.left, root.right) if root else True`
},

{
    id: 82,
        title: "Maximum Depth of Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given a binary tree, find its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
                        javaCode: `
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }`,
                            pythonCode: `
    def maxDepth(root):
        if not root:
            return 0
        return 1 + max(maxDepth(root.left), maxDepth(root.right))`
},

{
    id: 83,
        title: "Same Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Check whether two binary trees are structurally identical and the nodes have the same values.",
                        javaCode: `
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null  q == null  p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }`,
                            pythonCode: `
    def isSameTree(p, q):
        if not p and not q:
            return True
        if not p or not q or p.val != q.val:
            return False
        return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)`
},

{
    id: 84,
        title: "Balanced Binary Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Check if a binary tree is height-balanced. A binary tree is balanced if the left and right subtrees differ in height by no more than 1.",
                        javaCode: `
    public boolean isBalanced(TreeNode root) {
        return checkHeight(root) != -1;
    }
    
    private int checkHeight(TreeNode node) {
        if (node == null) return 0;
        int left = checkHeight(node.left);
        if (left == -1) return -1;
        int right = checkHeight(node.right);
        if (right == -1) return -1;
        if (Math.abs(left - right) > 1) return -1;
        return Math.max(left, right) + 1;
    }`,
                            pythonCode: `
    def isBalanced(root):
        def height(node):
            if not node:
                return 0
            left = height(node.left)
            right = height(node.right)
            if left == -1 or right == -1 or abs(left - right) > 1:
                return -1
            return 1 + max(left, right)
        return height(root) != -1`
},

{
    id: 85,
        title: "Path Sum",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given a binary tree and a sum, check if the tree has a root-to-leaf path such that adding up all the values equals the given sum.",
                        javaCode: `
    public boolean hasPathSum(TreeNode root, int sum) {
        if (root == null) return false;
        if (root.left == null && root.right == null) return root.val == sum;
        return hasPathSum(root.left, sum - root.val)  hasPathSum(root.right, sum - root.val);
    }`,
                            pythonCode: `
    def hasPathSum(root, targetSum):
        if not root:
            return False
        if not root.left and not root.right:
            return root.val == targetSum
        return hasPathSum(root.left, targetSum - root.val) or hasPathSum(root.right, targetSum - root.val)`
},

{
    id: 86,
        title: "Lowest Common Ancestor of BST",
            difficulty: "Medium",
                category: "Tree",
                    description: "Given a Binary Search Tree, find the lowest common ancestor (LCA) of two given nodes in the BST.",
                        javaCode: `
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (p.val < root.val && q.val < root.val)

PR!nce, [24-04-2025 22:39]
return lowestCommonAncestor(root.left, p, q);
        else if (p.val > root.val && q.val > root.val)
            return lowestCommonAncestor(root.right, p, q);
        else
            return root;
    }`,
                            pythonCode: `
    def lowestCommonAncestor(root, p, q):
        if p.val < root.val and q.val < root.val:
            return lowestCommonAncestor(root.left, p, q)
        elif p.val > root.val and q.val > root.val:
            return lowestCommonAncestor(root.right, p, q)
        else:
            return root`
},

{
    id: 87,
        title: "Subtree of Another Tree",
            difficulty: "Easy",
                category: "Tree",
                    description: "Given two non-empty binary trees s and t, check whether t is a subtree of s. A subtree of s is a tree consisting of a node in s and all of its descendants.",
                        javaCode: `
    public boolean isSubtree(TreeNode s, TreeNode t) {
        if (s == null) return false;
        if (isSameTree(s, t)) return true;
        return isSubtree(s.left, t)  isSubtree(s.right, t);
    }
    
    private boolean isSameTree(TreeNode s, TreeNode t) {
        if (s == null && t == null) return true;
        if (s == null  t == null  s.val != t.val) return false;
        return isSameTree(s.left, t.left) && isSameTree(s.right, t.right);
    }`,
                            pythonCode: `
    def isSubtree(s, t):
        if not s:
            return False
        if isSameTree(s, t):
            return True
        return isSubtree(s.left, t) or isSubtree(s.right, t)
    
    def isSameTree(s, t):
        if not s and not t:
            return True
        if not s or not t or s.val != t.val:
            return False
        return isSameTree(s.left, t.left) and isSameTree(s.right, t.right)`
},

{
    id: 88,
        title: "Number of Islands",
            difficulty: "Medium",
                category: "Graph",
                    description: "Given a 2D grid of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
                        javaCode: `
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    dfs(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }
    
    private void dfs(char[][] grid, int i, int j) {
        if (i < 0  j < 0  i >= grid.length  j >= grid[0].length  grid[i][j] == '0') return;
        grid[i][j] = '0';
        dfs(grid, i - 1, j);
        dfs(grid, i + 1, j);
        dfs(grid, i, j - 1);
        dfs(grid, i, j + 1);
    }`,
                            pythonCode: `
    def numIslands(grid):
        if not grid:
            return 0
    
        def dfs(i, j):
            if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] == '0':
                return
            grid[i][j] = '0'
            dfs(i+1, j)
            dfs(i-1, j)
            dfs(i, j+1)
            dfs(i, j-1)
    
        count = 0
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == '1':
                    dfs(i, j)
                    count += 1
        return count`
},

{
    id: 89,
        title: "Course Schedule",
            difficulty: "Medium",
                category: "Graph",
                    description: "You are given `numCourses` and a list of prerequisites. Return true if it's possible to finish all courses. Detect cycle in a directed graph using DFS.",
                        javaCode: `
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        for (int[] p : prerequisites) graph.get(p[0]).add(p[1]);
        
        int[] visited = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (!dfs(graph, visited, i)) return false;
        }
        return true;
    }

PR!nce, [24-04-2025 22:39]
private boolean dfs(List<List<Integer>> graph, int[] visited, int i) {
        if (visited[i] == 1) return false;
        if (visited[i] == 2) return true;
    
        visited[i] = 1;
        for (int j : graph.get(i)) {
            if (!dfs(graph, visited, j)) return false;
        }
        visited[i] = 2;
        return true;
    }`,
                            pythonCode: `
    def canFinish(numCourses, prerequisites):
        graph = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            graph[a].append(b)
    
        visited = [0] * numCourses
    
        def dfs(i):
            if visited[i] == 1:
                return False
            if visited[i] == 2:
                return True
            visited[i] = 1
            for j in graph[i]:
                if not dfs(j):
                    return False
            visited[i] = 2
            return True
    
        return all(dfs(i) for i in range(numCourses))`
},

{
    id: 90,
        title: "Alien Dictionary",
            difficulty: "Hard",
                category: "Graph",
                    description: "Given a sorted dictionary of alien language words, return the correct order of characters in the alien language.",
                        javaCode: `
    // Topological sort approach
    public String alienOrder(String[] words) {
        Map<Character, Set<Character>> adj = new HashMap<>();
        Map<Character, Integer> inDegree = new HashMap<>();
    
        for (String word : words) {
            for (char c : word.toCharArray()) {
                adj.putIfAbsent(c, new HashSet<>());
                inDegree.putIfAbsent(c, 0);
            }
        }
    
        for (int i = 0; i < words.length - 1; i++) {
            String first = words[i], second = words[i + 1];
            for (int j = 0; j < Math.min(first.length(), second.length()); j++) {
                char c1 = first.charAt(j), c2 = second.charAt(j);
                if (c1 != c2) {
                    if (adj.get(c1).add(c2)) {
                        inDegree.put(c2, inDegree.get(c2) + 1);
                    }
                    break;
                }
            }
        }
    
        Queue<Character> queue = new LinkedList<>();
        for (char c : inDegree.keySet()) {
            if (inDegree.get(c) == 0) queue.offer(c);
        }
    
        StringBuilder sb = new StringBuilder();
        while (!queue.isEmpty()) {
            char c = queue.poll();
            sb.append(c);
            for (char nei : adj.get(c)) {
                inDegree.put(nei, inDegree.get(nei) - 1);
                if (inDegree.get(nei) == 0) queue.offer(nei);
            }
        }
    
        return sb.length() == inDegree.size() ? sb.toString() : "";
    }`,
                            pythonCode: `
    def alienOrder(words):
        from collections import defaultdict, deque
        adj = defaultdict(set)
        in_degree = {c: 0 for word in words for c in word}
    
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i+1]
            for c1, c2 in zip(w1, w2):
                if c1 != c2:
                    if c2 not in adj[c1]:
                        adj[c1].add(c2)
                        in_degree[c2] += 1
                    break
    
        queue = deque([c for c in in_degree if in_degree[c] == 0])
        res = []
        while queue:
            c = queue.popleft()
            res.append(c)
            for nei in adj[c]:
                in_degree[nei] -= 1
                if in_degree[nei] == 0:
                    queue.append(nei)
    
        return "".join(res) if len(res) == len(in_degree) else ""`
},

{
    id: 91,
        title: "Graph Cycle Detection",
            difficulty: "Hard",
                category: "Graph",
                    description: "Detect whether a directed graph contains a cycle.",
                        javaCode: `
        public boolean hasCycle(int vertices, List<List<Integer>> edges) {
            int[] inDegree = new int[vertices];
            List<List<Integer>> adj = new ArrayList<>();

PR!nce, [24-04-2025 22:39]
for (int i = 0; i < vertices; i++) adj.add(new ArrayList<>());
            for (List<Integer> edge : edges) {
                adj.get(edge.get(0)).add(edge.get(1));
                inDegree[edge.get(1)]++;
            }
            
            Queue<Integer> queue = new LinkedList<>();
            for (int i = 0; i < vertices; i++) {
                if (inDegree[i] == 0) queue.offer(i);
            }
            
            int count = 0;
            while (!queue.isEmpty()) {
                int node = queue.poll();
                count++;
                for (int neighbor : adj.get(node)) {
                    inDegree[neighbor]--;
                    if (inDegree[neighbor] == 0) queue.offer(neighbor);
                }
            }
            
            return count != vertices;
        }`,
                            pythonCode: `
        def has_cycle(vertices, edges):
            from collections import defaultdict, deque
            adj = defaultdict(list)
            in_degree = [0] * vertices
            
            for u, v in edges:
                adj[u].append(v)
                in_degree[v] += 1
                
            queue = deque([i for i in range(vertices) if in_degree[i] == 0])
            count = 0
            while queue:
                node = queue.popleft()
                count += 1
                for neighbor in adj[node]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)
                        
            return count != vertices`
},

{
    id: 92,
        title: "Minimum Spanning Tree",
            difficulty: "Medium",
                category: "Graph",
                    description: "Find the minimum spanning tree of a weighted graph using Kruskal's algorithm.",
                        javaCode: `
        public int minSpanningTree(int vertices, int[][] edges) {
            Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
            UnionFind uf = new UnionFind(vertices);
            int cost = 0;
            
            for (int[] edge : edges) {
                if (uf.union(edge[0], edge[1])) cost += edge[2];
            }
            
            return cost;
        }
        
        class UnionFind {
            int[] parent, rank;
            public UnionFind(int n) {
                parent = new int[n];
                rank = new int[n];
                for (int i = 0; i < n; i++) parent[i] = i;
            }
            
            public int find(int x) {
                if (x != parent[x]) parent[x] = find(parent[x]);
                return parent[x];
            }
            
            public boolean union(int x, int y) {
                int px = find(x), py = find(y);
                if (px == py) return false;
                if (rank[px] > rank[py]) parent[py] = px;
                else if (rank[px] < rank[py]) parent[px] = py;
                else {
                    parent[py] = px;
                    rank[px]++;
                }
                return true;
            }
        }`,
                            pythonCode: `
        class UnionFind:
            def __init__(self, n):
                self.parent = list(range(n))
                self.rank = [0] * n
            
            def find(self, x):
                if x != self.parent[x]:
                    self.parent[x] = self.find(self.parent[x])
                return self.parent[x]
            
            def union(self, x, y):
                px, py = self.find(x), self.find(y)
                if px == py:
                    return False
                if self.rank[px] > self.rank[py]:
                    self.parent[py] = px
                elif self.rank[px] < self.rank[py]:
                    self.parent[px] = py
                else:
                    self.parent[py] = px
                    self.rank[px] += 1
                return True
        
        def min_spanning_tree(vertices, edges):
            edges.sort(key=lambda x: x[2])
            uf = UnionFind(vertices)
            cost = 0
            
            for u, v, weight in edges:
if uf.union(u, v):
                    cost += weight
            
            return cost`
},

{
    id: 93,
        title: "Lowest Common Ancestor in Binary Tree",
            difficulty: "Medium",
                category: "Tree",
                    description: "Find the lowest common ancestor (LCA) of two nodes in a binary tree.",
                        javaCode: `
        public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
            if (root == null  root == p || root == q) return root;
            TreeNode left = lowestCommonAncestor(root.left, p, q);
            TreeNode right = lowestCommonAncestor(root.right, p, q);
            return left == null ? right : right == null ? left : root;
        }`,
                            pythonCode: `
        def lowest_common_ancestor(root, p, q):
            if not root or root == p or root == q:
                return root
            left = lowest_common_ancestor(root.left, p, q)
            right = lowest_common_ancestor(root.right, p, q)
            return left if not right else right if not left else root`
},

{
    id: 94,
        title: "Longest Increasing Path in Matrix",
            difficulty: "Hard",
                category: "Graph",
                    description: "Find the longest increasing path in a matrix.",
                        javaCode: `
        public int longestIncreasingPath(int[][] matrix) {
            int m = matrix.length, n = matrix[0].length;
            int[][] memo = new int[m][n];
            int maxPath = 0;
    
            for (int i = 0; i < m; i++) {
                for (int j = 0; j < n; j++) {
                    maxPath = Math.max(maxPath, dfs(matrix, i, j, memo));
                }
            }
    
            return maxPath;
        }
    
        private int dfs(int[][] matrix, int i, int j, int[][] memo) {
            if (memo[i][j] != 0) return memo[i][j];
            int m = matrix.length, n = matrix[0].length, maxLen = 1;
            int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    
            for (int[] dir : dirs) {
                int x = i + dir[0], y = j + dir[1];
                if (x >= 0 && y >= 0 && x < m && y < n && matrix[x][y] > matrix[i][j]) {
                    maxLen = Math.max(maxLen, 1 + dfs(matrix, x, y, memo));
                }
            }
            memo[i][j] = maxLen;
            return maxLen;
        }`,
                            pythonCode: `
        def longest_increasing_path(matrix):
            from functools import lru_cache
            directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
            
            @lru_cache(None)
            def dfs(x, y):
                max_len = 1
                for dx, dy in directions:
                    nx, ny = x + dx, y + dy

PR!nce, [24-04-2025 22:39]
if 0 <= nx < len(matrix) and 0 <= ny < len(matrix[0]) and matrix[nx][ny] > matrix[x][y]:
                        max_len = max(max_len, 1 + dfs(nx, ny))
                return max_len
            
            return max(dfs(i, j) for i in range(len(matrix)) for j in range(len(matrix[0]))`
},

{
    id: 95,
        title: "Tree Diameter",
            difficulty: "Medium",
                category: "Tree",
                    description: "Calculate the diameter of a binary tree.",
                        javaCode: `
        public int diameterOfBinaryTree(TreeNode root) {
            int[] diameter = new int[1];
            depth(root, diameter);
            return diameter[0];
        }
    
        private int depth(TreeNode node, int[] diameter) {
            if (node == null) return 0;
            int left = depth(node.left, diameter);
            int right = depth(node.right, diameter);
            diameter[0] = Math.max(diameter[0], left + right);
            return Math.max(left, right) + 1;
        }`,
                            pythonCode: `
        def diameter_of_binary_tree(root):
            diameter = 0
            
            def depth(node):
                nonlocal diameter
                if not node:
                    return 0
                left = depth(node.left)
                right = depth(node.right)
                diameter = max(diameter, left + right)
                return max(left, right) + 1
            
            depth(root)
            return diameter`
},

{
    id: 96,
        title: "Course Schedule",
            difficulty: "Medium",
                category: "Graph",
                    description: "Determine if you can finish all courses given prerequisites (Directed Acyclic Graph).",
                        javaCode: `
        public boolean canFinish(int numCourses, int[][] prerequisites) {
            Map<Integer, List<Integer>> adj = new HashMap<>();
            int[] inDegree = new int[numCourses];
            for (int[] pre : prerequisites) {
                adj.putIfAbsent(pre[1], new ArrayList<>());
                adj.get(pre[1]).add(pre[0]);
                inDegree[pre[0]]++;
            }
            
            Queue<Integer> queue = new LinkedList<>();
            for (int i = 0; i < numCourses; i++) {
                if (inDegree[i] == 0) queue.offer(i);
            }
            
            int count = 0;
            while (!queue.isEmpty()) {
                int course = queue.poll();
                count++;
                if (!adj.containsKey(course)) continue;
                for (int next : adj.get(course)) {
                    inDegree[next]--;
                    if (inDegree[next] == 0) queue.offer(next);
                }
            }
            return count == numCourses;
        }`,
                            pythonCode: `
        def can_finish(numCourses, prerequisites):
            from collections import defaultdict, deque
            adj = defaultdict(list)
            in_degree = [0] * numCourses
            
            for pre in prerequisites:
                adj[pre[1]].append(pre[0])
                in_degree[pre[0]] += 1
            
            queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
            count = 0
            while queue:
                course = queue.popleft()
                count += 1
                for next in adj[course]:
                    in_degree[next] -= 1
                    if in_degree[next] == 0:
                        queue.append(next)
            
            return count == numCourses`
},

{
    id: 97,
        title: "Kth Smallest Element in a BST",
            difficulty: "Medium",
                category: "Tree",
                    description: "Find the kth smallest element in a Binary Search Tree (BST).",
                        javaCode: `
        public int kthSmallest(TreeNode root, int k) {
            Stack<TreeNode> stack = new Stack<>();
            while (true) {
                while (root != null) {
                    stack.push(root);
                    root = root.left;
                }
                root = stack.pop();
                if (--k == 0) return root.val;
                root = root.right;

PR!nce, [24-04-2025 22:39]
}
        }`,
                            pythonCode: `
        def kth_smallest(root, k):
            stack = []
            while True:
                while root:
                    stack.append(root)
                    root = root.left
                root = stack.pop()
                k -= 1
                if k == 0:
                    return root.val
                root = root.right`
},

{
    id: 98,
        title: "Word Ladder",
            difficulty: "Hard",
                category: "Graph",
                    description: "Find the shortest transformation sequence from the start word to the end word by changing one letter at a time.",
                        javaCode: `
        public int ladderLength(String beginWord, String endWord, List<String> wordList) {
            Set<String> wordSet = new HashSet<>(wordList);
            if (!wordSet.contains(endWord)) return 0;
            
            Queue<String> queue = new LinkedList<>();
            queue.offer(beginWord);
            int length = 1;
    
            while (!queue.isEmpty()) {
                int size = queue.size();
                for (int i = 0; i < size; i++) {
                    String word = queue.poll();
                    if (word.equals(endWord)) return length;
                    for (int j = 0; j < word.length(); j++) {
                        char[] chars = word.toCharArray();
                        for (char c = 'a'; c <= 'z'; c++) {
                            chars[j] = c;
                            String nextWord = new String(chars);
                            if (wordSet.contains(nextWord)) {
                                queue.offer(nextWord);
                                wordSet.remove(nextWord);
                            }
                        }
                    }
                }
                length++;
            }
            return 0;
        }`,
                            pythonCode: `
        def ladder_length(beginWord, endWord, wordList):
            word_set = set(wordList)
            if endWord not in word_set:
                return 0
            
            from collections import deque
            queue = deque([beginWord])
            length = 1
            
            while queue:
                for _ in range(len(queue)):
                    word = queue.popleft()
                    if word == endWord:
                        return length
                    for i in range(len(word)):
                        for c in 'abcdefghijklmnopqrstuvwxyz':
                            next_word = word[:i] + c + word[i+1:]
                            if next_word in word_set:
                                queue.append(next_word)
                                word_set.remove(next_word)
                length += 1
            return 0`
},

{
    id: 99,
        title: "Serialize and Deserialize Binary Tree",
            difficulty: "Hard",
                category: "Tree",
                    description: "Serialize and deserialize a binary tree.",
                        javaCode: `
        public class Codec {
            public String serialize(TreeNode root) {
                if (root == null) return "null,";
                return root.val + "," + serialize(root.left) + serialize(root.right);
            }
            
            public TreeNode deserialize(String data) {
                Queue<String> nodes = new LinkedList<>(Arrays.asList(data.split(",")));
                return buildTree(nodes);
            }
            
            private TreeNode buildTree(Queue<String> nodes) {
                String val = nodes.poll();
                if (val.equals("null")) return null;
                TreeNode node = new TreeNode(Integer.parseInt(val));
                node.left = buildTree(nodes);
                node.right = buildTree(nodes);
                return node;
            }
        }`,
                            pythonCode: `
        class Codec:
            def serialize(self, root):
                def dfs(node):
                    if not node:
                        vals.append("null")
                        return
                    vals.append(str(node.val))
                    dfs(node.left)

PR!nce, [24-04-2025 22:39]
dfs(node.right)
                
                vals = []
                dfs(root)
                return ",".join(vals)
    
            def deserialize(self, data):
                def dfs():
                    val = next(vals)
                    if val == "null":
                        return None
                    node = TreeNode(int(val))
                    node.left = dfs()
                    node.right = dfs()
                    return node
                
                vals = iter(data.split(","))
                return dfs()`
},

{
    id: 100,
        title: "Binary Tree Maximum Path Sum",
            difficulty: "Hard",
                category: "Tree",
                    description: "Find the maximum path sum in a binary tree.",
                        javaCode: `
        public int maxPathSum(TreeNode root) {
            int[] maxSum = new int[1];
            maxSum[0] = Integer.MIN_VALUE;
            maxGain(root, maxSum);
            return maxSum[0];
        }
        
        private int maxGain(TreeNode node, int[] maxSum) {
            if (node == null) return 0;
            int left = Math.max(maxGain(node.left, maxSum), 0);
            int right = Math.max(maxGain(node.right, maxSum), 0);
            maxSum[0] = Math.max(maxSum[0], left + right + node.val);
            return node.val + Math.max(left, right);
        }`,
                            pythonCode: `
        def max_path_sum(root):
            max_sum = float('-inf')
            
            def max_gain(node):
                nonlocal max_sum
                if not node:
                    return 0
                left = max(max_gain(node.left), 0)
                right = max(max_gain(node.right), 0)
                max_sum = max(max_sum, left + right + node.val)
                return node.val + max(left, right)
            
            max_gain(root)
            return max_sum`
},    
    
  ];

  const totalPages = Math.ceil(dsaQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = dsaQuestions.slice(startIndex, endIndex);
  const toggleQuestion = (id: number) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  return <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-4">Top 100 DSA Interview Questions</h1>
            <p className="text-gray-600 text-lg mb-8">
              Master the most important Data Structures and Algorithms questions with detailed explanations
              and code samples in Java and Python.
            </p>
            {profile && (
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Your progress</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(solvedQuestions.length / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{solvedQuestions.length}%</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Solve more questions to earn higher badges!
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="mb-1 text-sm font-medium">Current badge</div>
                    <div className={`flex items-center px-4 py-2 rounded-full 
                      ${profile.badge === "Beginner" ? "bg-gradient-to-r from-green-200 to-green-300 text-black" : 
                        profile.badge === "Bronze" ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white" :
                        profile.badge === "Silver" ? "bg-gradient-to-r from-gray-300 to-gray-400 text-black" :
                        profile.badge === "Gold" ? "bg-gradient-to-r from-yellow-300 to-amber-500 text-black" :
                        "bg-gradient-to-r from-blue-400 to-purple-500 text-white"}`}>
                      {profile.badge === "Diamond" ? <Award className="w-4 h-4 mr-2" /> : 
                       profile.badge === "Gold" ? <Star className="w-4 h-4 mr-2 fill-current" /> :
                       profile.badge !== "Beginner" ? <Star className="w-4 h-4 mr-2" /> : null}
                      <span className="font-semibold">{profile.badge}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Beginner (0)</span>
                    <span>Bronze (25)</span>
                    <span>Silver (50)</span>
                    <span>Gold (75)</span>
                    <span>Diamond (100)</span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full">
                    <div className="absolute h-2 bg-gradient-to-r from-green-300 via-amber-500 to-blue-500 rounded-full"
                      style={{ width: `${(solvedQuestions.length / 100) * 100}%` }}
                    ></div>
                    {[0, 25, 50, 75, 100].map((threshold) => (
                      <div 
                        key={threshold}
                        className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-0
                          ${solvedQuestions.length >= threshold ? 'bg-primary' : 'bg-gray-400'}`}
                        style={{ left: `${threshold}%`, top: 0 }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentQuestions.map(question => (
              <Card key={question.id} className="transform transition-all duration-300 hover:shadow-lg animate-fade-in-slow">
                <CardHeader className="cursor-pointer" onClick={() => toggleQuestion(question.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Checkbox 
                          id={`question-${question.id}`}
                          checked={solvedQuestions.includes(question.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxClick(question.id);
                          }}
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {question.id}. {question.title}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-sm px-2 py-1 rounded-full ${question.difficulty === "Easy" ? "bg-green-100 text-green-700" : question.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {question.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedQuestion === question.id ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
                  </div>
                </CardHeader>

                {expandedQuestion === question.id && <CardContent className="animate-accordion-down">
                    <div className="space-y-4">
                      <p className="text-gray-700">{question.description}</p>
                      
                      <Tabs defaultValue="java" className="w-full">
                        <TabsList>
                          <TabsTrigger value="java">Java</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        <TabsContent value="java">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code>{question.javaCode}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="python">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code>{question.pythonCode}</code>
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>}
              </Card>
            ))}
          </div>

          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
              
              {Array.from({
              length: totalPages
            }, (_, i) => i + 1).map(page => <PaginationItem key={page}>
                  <PaginationLink href="#" onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                    {page}
                  </PaginationLink>
                </PaginationItem>)}

              <PaginationItem>
                <PaginationNext href="#" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
      <Footer />

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Question Solved</AlertDialogTitle>
            <AlertDialogDescription>
              Khao Ma Kasam! You have Solved this on your Code Editor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSolved}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSolved}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default DSAQuestions;
